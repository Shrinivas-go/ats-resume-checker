# ATS Resume Checker

Monorepo for the ATS Resume Checker application.

## Structure

```
├── backend/     # Node.js + Express API (Render)
├── frontend/    # React + Vite app (Vercel)
├── render.yaml    # Render deploy config (rootDir: backend)
└── frontend/vercel.json
```

## Local development

### Backend (port 5000)

```bash
cd backend
cp .env.example .env   # fill in secrets
npm install
npm run dev
```

### Frontend (port 5173)

```bash
cd frontend
# create .env.local with:
# VITE_API_URL=http://localhost:5000
# VITE_GOOGLE_CLIENT_ID=your-client-id
npm install
npm run dev
```

## Production URLs

| Service  | Host    |
|----------|---------|
| API      | Render  |
| Web app  | Vercel  |

Set `VITE_API_URL` on Vercel to your Render API URL.  
Set `FRONTEND_URL` on Render to your Vercel URL (comma-separated with `http://localhost:5173` for local dev).

## Deploy (single GitHub repo)

### 1. Push to GitHub

Create a repo named **ats-resume-checker** on GitHub, then:

```bash
cd ats
git remote add origin https://github.com/YOUR_USERNAME/ats-resume-checker.git
git branch -M main
git push -u origin main
```

You can archive or delete the old separate `ats-backend` and `ats-resume-checker` repos after migrating.

### 2. Render (backend)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** (or edit existing service)
2. Connect the **ats-resume-checker** repo
3. Use root `render.yaml` — it sets **`rootDir: backend`**
4. Or manually: **Root Directory** = `backend`, **Build** = `npm install`, **Start** = `npm start`, **Health** = `/health`
5. Set environment variables (same as before): `MONGODB_URI`, JWT secrets, `FRONTEND_URL`, `NODE_ENV=production`, `NODE_VERSION=20.18.0`, etc.

### 3. Vercel (frontend)

1. [vercel.com](https://vercel.com) → **Add New Project** → import **ats-resume-checker**
2. **Root Directory** → `frontend` (required for monorepo)
3. Framework: **Vite** (auto-detected)
4. Environment variables:
   - `VITE_API_URL` = `https://ats-backend-vi2h.onrender.com` (your Render URL)
   - `VITE_GOOGLE_CLIENT_ID` = your Google OAuth client ID
5. **Deploy**

### 4. After deploy

- Render: `FRONTEND_URL` = your Vercel URL + `http://localhost:5173`
- Google Cloud: authorized origins = Vercel URL + localhost
- Test `/health` on Render and **Parse Resume** on Vercel

### Cleanup (local)

Delete the old duplicate folder if it still exists:

- `ats-backend/` (copy is now in `backend/`)
