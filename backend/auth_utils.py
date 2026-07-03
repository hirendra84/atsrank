import jwt
import datetime
import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from auth_db import User, get_db
from config import (
    JWT_SECRET, 
    GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI,
    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: datetime.timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

def exchange_github_code(code: str) -> str:
    url = "https://github.com/login/oauth/access_token"
    headers = {"Accept": "application/json"}
    payload = {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": GITHUB_REDIRECT_URI,
    }
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange GitHub code")
    
    res_data = response.json()
    if "access_token" not in res_data:
        raise HTTPException(status_code=400, detail=res_data.get("error_description", "Failed GitHub OAuth"))
        
    return res_data["access_token"]

def get_github_user_info(access_token: str) -> dict:
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Get user profile
    user_response = requests.get("https://api.github.com/user", headers=headers)
    if user_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch GitHub user profile")
    user_data = user_response.json()
    
    # Get user email
    email_response = requests.get("https://api.github.com/user/emails", headers=headers)
    email = None
    if email_response.status_code == 200:
        emails = email_response.json()
        primary_email = next((e for e in emails if e.get("primary")), None)
        if primary_email:
            email = primary_email.get("email")
            
    if not email:
        email = user_data.get("email") or f"{user_data.get('login')}@github.com"
        
    return {
        "github_id": str(user_data.get("id")),
        "email": email,
    }

def exchange_google_code(code: str) -> str:
    url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    
    response = requests.post(url, data=payload)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Failed to exchange Google code: {response.text}")
    
    res_data = response.json()
    if "access_token" not in res_data:
        raise HTTPException(status_code=400, detail="Failed Google OAuth: token not returned")
        
    return res_data["access_token"]

def get_google_user_info(access_token: str) -> dict:
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch Google user profile")
    
    user_data = response.json()
    email = user_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no associated email")
        
    return {
        "google_id": str(user_data.get("id")),
        "email": email,
    }
