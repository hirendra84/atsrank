import os
import shutil
import json
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from pdf import PDFHandler
from score import _evaluate_resume
from github import fetch_and_display_github_info

from auth_db import get_db, User
from auth_utils import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    exchange_github_code,
    get_github_user_info,
    exchange_google_code,
    get_google_user_info
)
from config import GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI, GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, FRONTEND_URL
app = FastAPI(title="AtsRank Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schemas for auth
class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@app.get("/")
def health_check():
    return {"status": "ok"}

# Authentication Endpoints
@app.post("/api/auth/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pwd,
        scans_remaining=3  # 3 free scans
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    token = create_access_token({"sub": new_user.email})
    return {"access_token": token, "token_type": "bearer", "scans_remaining": new_user.scans_remaining}

@app.post("/api/auth/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "scans_remaining": user.scans_remaining}

@app.get("/api/auth/github/login")
def github_login():
    github_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
        f"&scope=user:email"
    )
    return RedirectResponse(github_url)

@app.get("/api/auth/github/callback")
def github_callback(code: str, db: Session = Depends(get_db)):
    # Exchange code for access token
    github_token = exchange_github_code(code)
    
    # Fetch GitHub user information
    github_info = get_github_user_info(github_token)
    github_id = github_info["github_id"]
    email = github_info["email"]
    
    # Check if user exists by github_id or email
    user = db.query(User).filter((User.github_id == github_id) | (User.email == email)).first()
    
    if not user:
        # Create a new user
        user = User(
            email=email,
            github_id=github_id,
            scans_remaining=3 # 3 free scans
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.github_id:
        # Link GitHub to existing email account
        user.github_id = github_id
        db.commit()
        db.refresh(user)
        
    # Generate app JWT token
    token = create_access_token({"sub": user.email})
    
    # Redirect to frontend callback page with the token
    redirect_url = f"{FRONTEND_URL}/auth-callback?token={token}"
    return RedirectResponse(redirect_url)

@app.get("/api/auth/google/login")
def google_login():
    google_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?response_type=code"
        f"&client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&scope=openid%20email%20profile"
    )
    return RedirectResponse(google_url)

@app.get("/api/auth/google/callback")
def google_callback(code: str, db: Session = Depends(get_db)):
    # Exchange code for access token
    google_token = exchange_google_code(code)
    
    # Fetch Google user information
    google_info = get_google_user_info(google_token)
    google_id = google_info["google_id"]
    email = google_info["email"]
    
    # Check if user exists by google_id or email
    user = db.query(User).filter((User.google_id == google_id) | (User.email == email)).first()
    
    if not user:
        # Create a new user
        user = User(
            email=email,
            google_id=google_id,
            scans_remaining=3 # 3 free scans
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.google_id:
        # Link Google to existing account
        user.google_id = google_id
        db.commit()
        db.refresh(user)
        
    # Generate app JWT token
    token = create_access_token({"sub": user.email})
    
    # Redirect to frontend callback page with the token
    redirect_url = f"{FRONTEND_URL}/auth-callback?token={token}"
    return RedirectResponse(redirect_url)

@app.get("/api/users/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "scans_remaining": current_user.scans_remaining,
        "github_id": current_user.github_id,
        "google_id": current_user.google_id,
        "created_at": current_user.created_at
    }

# Update Resume scan packages
@app.post("/api/users/add-scans")
def add_scans(amount: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid scan amount")
    current_user.scans_remaining += amount
    db.commit()
    db.refresh(current_user)
    return {"scans_remaining": current_user.scans_remaining}

# Guarded Analyze Endpoint
@app.post("/api/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.scans_remaining <= 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have run out of resume scans. Please upgrade your plan."
        )

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    file_path = f"temp_{file.filename}"
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        pdf_handler = PDFHandler()
        resume_data = pdf_handler.extract_json_from_pdf(file_path)
        
        if not resume_data:
            raise HTTPException(status_code=500, detail="Failed to parse resume from PDF")
            
        github_data = {}
        profiles = resume_data.basics.profiles if resume_data and hasattr(resume_data, "basics") and resume_data.basics else []
        github_profile = next((p for p in profiles if p.network and p.network.lower() == "github"), None)
        
        if github_profile:
            try:
                github_data = fetch_and_display_github_info(github_profile.url)
            except Exception as e:
                print(f"Failed to fetch github data: {e}")
            
        evaluation = _evaluate_resume(resume_data, github_data)
        
        # Decrement user scans
        current_user.scans_remaining -= 1
        db.commit()
        db.refresh(current_user)
        
        return {
            "resume_data": resume_data.model_dump() if resume_data else None,
            "evaluation": evaluation.model_dump() if evaluation else None,
            "github_data": github_data,
            "scans_remaining": current_user.scans_remaining
        }
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=traceback.format_exc())
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

