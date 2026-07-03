# 🚀 AtsRank: AI-Powered Resume Analyzer & ATS Scorer

![AtsRank Banner](frontend/public/og-image.jpg)

**AtsRank** is an AI-powered SaaS platform designed to solve a massive problem for job seekers: getting past the Applicant Tracking System (ATS). 

Most candidates submit resumes into a "black hole" and never hear back because automated ATS filters reject them for poor formatting, missing keywords, or structural issues. AtsRank flips the script by giving candidates access to the same technology recruiters use. 

When a user uploads their resume, AtsRank acts as an expert auditor:
1. It parses the PDF to see exactly what an ATS bot sees.
2. It evaluates structural compliance, technical skills, and experience.
3. It uses Large Language Models (LLMs) to generate a detailed alignment score, identify missing skill gaps, and provide actionable, sentence-by-sentence improvement tips.
4. It does all of this with a **privacy-first, stateless approach**—the PDF is processed in-memory and immediately destroyed, leaving only the user's scan credits stored in the database.

---

## 🏗️ Technical Architecture

AtsRank is built as a **Modern Monorepo**, separated into two distinct services designed for high performance and easy deployment.

### 1. The Frontend (Client-Side)
* **Framework:** Next.js (React) using the App Router.
* **Styling & UI:** Tailwind CSS for a highly responsive, glassmorphism-inspired, and modern aesthetic.
* **Animations:** Framer Motion is used for micro-interactions (like the scanning progress bar and modal transitions) to make the app feel premium and alive.
* **State Management:** Stateless API communication. The UI reacts to the backend responses, using `localStorage` to securely hold the user's JWT token (`atsrank_token`).
* **SEO Optimized:** Fully configured with Next.js Metadata, Open Graph tags, JSON-LD structured data, and dynamic canonical links to ensure top-tier search engine visibility.

### 2. The Backend (Server-Side)
* **Framework:** FastAPI (Python). Chosen for its incredible speed, asynchronous capabilities, and native support for Pydantic (data validation).
* **Document Processing:** Custom Python logic (`pdf.py`) strictly handles PDF binary parsing to extract text and structure precisely how an enterprise ATS would.
* **AI & LLM Engine:** An abstraction layer (`llm_utils.py`) connects to powerful AI models (Groq for ultra-fast Llama-3 inference, with fallbacks to Google Gemini). The `prompt.py` module forces the AI to return strict JSON responses containing scores and actionable feedback.
* **External Integrations:** If a developer applies, the backend seamlessly pings the GitHub API to fetch contribution metrics and open-source data to supplement the resume score.

### 3. Database & Authentication
* **Database:** PostgreSQL (managed via SQLAlchemy). The schema is lean and focused on user management rather than hoarding candidate data. 
* **Auth System:** A robust, custom JWT authentication flow (`auth_utils.py`). It supports traditional Email/Password registration as well as seamless **OAuth2** (Google and GitHub).
* **Credits System:** The database tracks `scans_remaining` (giving users 3 free scans upon signup) and acts as the gatekeeper before the costly LLM analysis is triggered.

---

## 💡 Why this architecture is brilliant:

1. **Decoupled Scaling:** Because the heavy lifting (PDF parsing and LLM inference) happens on the FastAPI backend, you can scale the backend compute instances entirely independently of your Next.js frontend.
2. **Cost Efficiency:** By utilizing Groq and intelligent prompt engineering, you keep latency down and API costs incredibly low compared to heavier GPT-4 pipelines.
3. **Enterprise Privacy:** By keeping the analysis "stateless" (not saving the parsed resume to a database or AWS S3), you instantly build trust with users who are highly protective of their personal data. 

---

## 🚀 Getting Started Locally

### Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Install requirements: `pip install -r requirements.txt`
3. Copy the environment template: `cp .env.example .env` and fill in your keys.
4. Run the server: `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open `http://localhost:3000` in your browser.

---
*Built to help candidates land their dream jobs by beating the algorithms.*
