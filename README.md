<p align="center">
  <h1 align="center">📄 ATS Resume Checker</h1>
  <p align="center">
    <strong>A full-stack SaaS application that scores resumes against job descriptions using a weighted ATS scoring engine.</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a> •
    <a href="#license">License</a>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-black?style=flat-square&logo=vercel&logoColor=white" alt="Deployed" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License" />
</p>

---

## Overview

ATS Resume Checker helps job seekers optimize their resumes for Applicant Tracking Systems. Users upload a PDF resume, paste a job description, and receive a detailed ATS compatibility score with actionable feedback — including missing keywords, skills gap analysis, and improvement suggestions.

The application is structured as a **monorepo** with a React frontend and Node.js/Express backend, featuring a **credit-based SaaS model** with integrated payment processing via Stripe and Razorpay.

### Problem

Most resumes are rejected by ATS software before a human ever reads them. Job seekers often don't know which keywords they're missing or how to structure their resume for automated screening.

### Solution

This application provides a **weighted scoring algorithm** that differentiates between core and optional skills, generates targeted feedback, and offers an improvement simulator — giving users a clear roadmap to improve their ATS compatibility score.

---

## Features

### Core ATS Engine
- **PDF Resume Parsing** — Extracts structured data (contact info, skills, experience, education) from uploaded PDF resumes
- **Job Description Analysis** — Extracts and categorizes required vs. optional skills from job descriptions
- **Weighted ATS Scoring** — Scores resumes using a weighted algorithm that prioritizes core skills over optional ones
- **Skills Gap Analysis** — Identifies matched and missing skills with detailed breakdowns
- **ATS Feedback Generation** — Produces actionable, section-by-section improvement suggestions
- **Improvement Simulator** — Simulates how adding specific skills would impact the overall score

### AI Assistant
- **Natural Language Queries** — Ask questions like "Why is my score low?" or "What skills am I missing?"
- **5-Layer Processing Pipeline** — Domain validation → Intent detection → Context retrieval → Decision engine → Response generation
- **Intent Classification** — Recognizes 6+ intent types (score explanation, skills gap, JD match, experience improvement, keyword suggestion, formatting feedback)

### Resume Builder
- **Section-Based Editor** — Add/remove/reorder sections (contact, experience, education, skills, certifications)
- **Live Preview** — Real-time resume preview as you type
- **Description Generator** — Generates professional bullet points for experience entries
- **Multi-Format Export** — Download as PDF or DOCX

### Job Description Generator
- **Template-Based Generation** — Creates job descriptions based on role, seniority, company type, and tech stack
- **Multiple Company Cultures** — Supports startup, corporate, agency, and remote-first templates
- **Role-Specific Skills** — Pre-mapped skill requirements for 5+ role categories

### Authentication & User Management
- **Local Authentication** — Email/password registration with bcrypt hashing (12 salt rounds)
- **Google OAuth 2.0** — One-click sign-in via Google
- **JWT Token Pair** — Access token (15min) + refresh token (7 days) with automatic rotation
- **Secure Cookie Storage** — Refresh tokens stored in HTTP-only cookies
- **User Profiles** — Customizable avatars, location, and account settings

### Credit System & Payments
- **Freemium Model** — 3 free credits on signup; first scan available without authentication
- **Dual Payment Gateways** — Stripe (international) and Razorpay (India) integration
- **Webhook Verification** — Server-side payment verification for both gateways
- **Transaction History** — Complete audit trail of credit purchases, usage, and bonuses
- **Scan History** — Track past analyses with scores and results

### Security & Performance
- **Helmet.js** — HTTP security headers
- **CORS** — Dynamic origin validation for multi-environment deployment
- **Rate Limiting** — Configurable per-endpoint rate limits (API + upload endpoints)
- **Input Validation** — Zod schema validation on all inputs
- **File Filtering** — MIME type + extension validation for PDF uploads (5MB limit)

### Frontend
- **Responsive Design** — Mobile-first CSS Modules with dark/light theme support
- **Animated UI** — Framer Motion page transitions and micro-animations
- **Component Library** — Custom reusable UI components (Button, Card, Input, Alert, Badge, Accordion, ScoreRing, ScanningAnimation, Marquee)
- **Protected Routes** — Auth-guarded dashboard and profile pages
- **Landing Page** — Feature showcase, testimonials, FAQ, and CTA sections

### Testing
- **Backend Unit Tests** — Jest tests for ATS scoring, comparison, feedback, normalization, and AI intent detection
- **Backend Integration Tests** — Supertest-based API tests for auth and ATS routes with MongoDB Memory Server
- **Frontend Unit Tests** — Vitest + React Testing Library component tests
- **E2E Tests** — Playwright tests for login flow, resume upload, and full scan flow

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 7, React Router 7, Framer Motion, Lucide Icons, CSS Modules, Radix UI |
| **Backend** | Node.js 20, Express 5, Mongoose 9, Multer, pdf-parse, Zod |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT (access + refresh tokens), Google OAuth 2.0, bcryptjs |
| **Payments** | Stripe, Razorpay |
| **Testing** | Jest, Supertest, MongoDB Memory Server, Vitest, React Testing Library, Playwright |
| **Deployment** | Vercel (frontend), Render (backend), Render Blueprint |
| **Security** | Helmet, CORS, express-rate-limit, cookie-parser |
| **Export** | jsPDF, html2canvas, html-docx-js-typescript, file-saver |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React + Vite)                   │
│  Landing → Auth → Dashboard → Resume Analysis → Resume Builder  │
│                    ↕ Axios (JWT in headers, refresh in cookies)  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                     API SERVER (Express 5)                       │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │  Auth    │  │ Credits  │  │  Profile  │  │   Support     │  │
│  │ Routes   │  │ Routes   │  │  Routes   │  │   Routes      │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └───────┬───────┘  │
│       │              │              │                │           │
│  ┌────▼──────────────▼──────────────▼────────────────▼───────┐  │
│  │              MIDDLEWARE LAYER                              │  │
│  │  auth · creditGate · rateLimiter · validate · admin       │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────▼───────────────────────────────────┐  │
│  │              ATS ENGINE (12 modules)                       │  │
│  │  parser · pdfExtract · jd · jdWeight · compare ·           │  │
│  │  compareWeighted · score · scoreWeighted · feedback ·      │  │
│  │  simulator · analyzer · normalize                          │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────▼───────────────────────────────────┐  │
│  │              AI ASSISTANT                                  │  │
│  │  Intent Detection → Context Retrieval → Decision Engine    │  │
│  │  → Response Generation                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    MongoDB Atlas                                 │
│         Users · Credits · ScanHistory                            │
└──────────────────────────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌──────────┐       ┌──────────┐       ┌──────────┐
   │  Stripe  │       │ Razorpay │       │  Google  │
   │ Webhooks │       │ Webhooks │       │  OAuth   │
   └──────────┘       └──────────┘       └──────────┘
```

### Request Flow

1. **User** uploads a PDF resume and pastes a job description on the frontend
2. **Frontend** sends the PDF to the Express API via multipart form upload
3. **Backend** extracts text from the PDF using `pdf-parse`
4. **ATS Engine** parses the resume text into structured sections, extracts weighted skills from the JD, compares them against resume skills, and calculates a weighted ATS score
5. **Feedback Generator** produces actionable improvement suggestions based on the score breakdown
6. **Response** is sent back to the frontend with score, matched/missing skills, and recommendations

---

## Folder Structure

```
ats-resume-checker/
├── backend/
│   ├── ats/                    # ATS scoring engine (12 modules)
│   │   ├── parser.utils.js         # Resume text → structured data
│   │   ├── pdfExtract.utils.js     # PDF → raw text extraction
│   │   ├── jdWeight.utils.js       # JD → weighted skill extraction
│   │   ├── compareWeighted.utils.js # Skill matching algorithm
│   │   ├── scoreWeighted.utils.js   # Weighted score calculation
│   │   ├── feedback.utils.js        # Actionable feedback generation
│   │   ├── simulator.utils.js       # Score improvement simulation
│   │   └── ...                      # normalize, compare, jd, score, analyzer
│   ├── src/
│   │   ├── ai/                 # AI assistant (intent → decision → response)
│   │   ├── config/             # Environment & database configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── middlewares/        # Auth, rate limiting, credit gating, validation
│   │   ├── models/             # Mongoose schemas (User, Credit, ScanHistory)
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Business logic (auth, credit, email, payment, token)
│   │   └── validators/         # Zod input validation schemas
│   ├── tests/                  # Unit + integration tests
│   └── index.js                # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AIAssistant/        # Chat-style AI assistant
│   │   │   ├── ResumeBuilder/      # Builder components (preview, description gen)
│   │   │   ├── layout/             # Navbar, Footer
│   │   │   ├── landing/            # Landing page sections
│   │   │   └── ui/                 # Design system (Button, Card, Input, etc.)
│   │   ├── context/            # React Context (Auth, Theme, Avatar)
│   │   ├── pages/              # Route-level page components
│   │   ├── styles/             # Global styles and theme variables
│   │   └── config/             # API configuration
│   ├── tests/                  # Unit + E2E tests
│   └── index.html              # HTML entry point
├── render.yaml                 # Render deployment blueprint
└── package.json                # Monorepo root scripts
```

---

## Installation

### Prerequisites

- **Node.js** ≥ 20.18.0
- **MongoDB** — [MongoDB Atlas](https://www.mongodb.com/atlas) free tier or local instance
- **Google OAuth credentials** — [Google Cloud Console](https://console.cloud.google.com/) (optional, for Google login)

### 1. Clone the repository

```bash
git clone https://github.com/Shrinivas-go/ats-resume-checker.git
cd ats-resume-checker
```

### 2. Install dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install:all
```

### 3. Configure environment variables

#### Backend (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values (see [Environment Variables](#environment-variables) below).

#### Frontend (`frontend/.env.local`)

```bash
# Create frontend/.env.local
echo "VITE_API_URL=http://localhost:5000" > frontend/.env.local
echo "VITE_GOOGLE_CLIENT_ID=your-google-client-id" >> frontend/.env.local
```

### 4. Start development servers

```bash
# Terminal 1 — Backend (port 5000)
npm run dev:backend

# Terminal 2 — Frontend (port 5173)
npm run dev:frontend
```

### 5. Verify setup

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend health check: [http://localhost:5000/health](http://localhost:5000/health)
- API documentation: [http://localhost:5000](http://localhost:5000)

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/ats` |
| `JWT_ACCESS_SECRET` | JWT access token secret (min 32 chars) | `your-random-secret` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret (min 32 chars) | `your-random-secret` |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `FRONTEND_URL` | Allowed CORS origins (comma-separated) | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `your-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `your-client-secret` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `RAZORPAY_KEY_ID` | Razorpay key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | `your-razorpay-secret` |
| `ADMIN_EMAIL` | Admin email (bypasses credit limits) | `admin@example.com` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | `your-client-id.apps.googleusercontent.com` |

---

## Usage

### Analyzing a Resume

1. Navigate to the **Analyze** page (`/analyze`)
2. Upload your resume as a PDF (max 5MB)
3. Paste the target job description
4. Click **Scan Resume** to receive your ATS score
5. Review the breakdown: matched skills, missing skills, and improvement suggestions
6. Use the **AI Assistant** to ask follow-up questions about your results

### Building a Resume

1. Navigate to the **Resume Builder** (`/builder`)
2. Fill in your contact information, experience, education, and skills
3. Use the **Description Generator** to create professional bullet points
4. Preview your resume in real-time
5. Export as PDF or DOCX

### Generating a Job Description

1. Navigate to the **JD Generator** (`/jd-generator`)
2. Select the role, seniority level, company type, and tech stack
3. Generate a structured job description
4. Use it to test your resume against different roles

---

## Screenshots

<p align="center">
  <strong>Landing Page</strong><br/>
  <img src="docs/screenshots/landing-page.png" alt="ATS Resume Checker Landing Page" width="700" />
</p>

<p align="center">
  <strong>ATS Score Analysis</strong><br/>
  <img src="docs/screenshots/ats-score-analysis.png" alt="ATS Score Analysis Dashboard" width="700" />
</p>

<p align="center">
  <strong>Resume Builder</strong><br/>
  <img src="docs/screenshots/resume-builder.png" alt="Resume Builder Interface" width="700" />
</p>

<p align="center">
  <strong>AI Assistant</strong><br/>
  <img src="docs/screenshots/ai-assistant.png" alt="AI Assistant Chat Interface" width="700" />
</p>

---

## Running Tests

```bash
# Backend unit tests
cd backend
npm test

# Backend unit tests only
npm run test:unit

# Backend integration tests
npm run test:integration

# Backend test coverage
npm run test:coverage

# Frontend unit tests
cd frontend
npm test

# Frontend E2E tests (requires running dev server)
npm run test:e2e

# Frontend test coverage
npm run test:coverage
```

---

## Deployment

The application is deployed as two separate services from a single monorepo:

| Service | Platform | Root Directory |
|---------|----------|---------------|
| Frontend | Vercel | `frontend/` |
| Backend | Render | `backend/` |

A `render.yaml` blueprint is included for one-click Render deployment. See the detailed [deployment guide](https://render.com/docs/blueprint-spec) for configuration.

---

## Future Improvements

- [ ] **LLM-Powered Resume Rewriting** — Integrate OpenAI or similar for automated resume bullet point rewriting (infrastructure is partially built)
- [ ] **Multi-Format Resume Upload** — Support DOCX and TXT formats in addition to PDF
- [ ] **Scan Comparison History** — Compare scores across multiple scans to track improvement over time
- [ ] **Admin Dashboard** — Analytics panel for monitoring user activity and scan metrics
- [ ] **Email Notifications** — Automated emails for scan results and credit purchase confirmations (Nodemailer is integrated)
- [ ] **Resume Templates** — Pre-built ATS-friendly resume templates in the builder

---

## Learning Outcomes

Building or studying this project demonstrates understanding of:

- **Full-Stack SaaS Architecture** — Designing a monorepo with separate frontend and backend services, each independently deployable
- **Authentication Patterns** — Implementing JWT access/refresh token rotation, Google OAuth 2.0, and secure cookie handling
- **Payment Gateway Integration** — Working with Stripe and Razorpay APIs including webhook verification for reliable payment processing
- **Algorithm Design** — Building a weighted scoring algorithm that categorizes and compares skills with normalization and fuzzy matching
- **AI/NLP Pipeline (Rule-Based)** — Implementing a multi-layer intent detection and response generation system without external AI APIs
- **Credit-Based Monetization** — Designing a freemium model with credit tracking, transaction history, and gated features
- **API Security** — Applying rate limiting, CORS configuration, Helmet headers, input validation (Zod), and file upload restrictions
- **Testing Strategy** — Writing unit, integration, and E2E tests across both frontend and backend with in-memory database mocking
- **Deployment & DevOps** — Configuring multi-service deployment with Render Blueprints and Vercel, including health checks and environment management

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
