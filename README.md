# AI Leftover Food Planner

A local, full-stack food planning and waste reduction web app designed for a college mini-project demo.

## Overview

The application helps users manage pantry ingredients, scan food images, detect expiry dates, identify missing ingredients, recommend recipes, plan meals, and track food waste with a local SQLite database.

## Project structure

- `frontend/` – React + TypeScript + Vite app
- `backend/` – FastAPI backend and SQLite persistence
- `docs/` – documentation and demo notes
- `scripts/` – Windows startup/shutdown scripts

## Local demo URLs

- Frontend: http://localhost:5173/
- Backend: http://localhost:8000/
- API docs: http://localhost:8000/docs

## Demo user

- Email: demo@leftover.ai
- Password: Demo123!

## How to run

1. Open a terminal in the workspace root.
2. Start backend: `python -m venv backend/.venv` and `backend/.venv\Scripts\python -m pip install -r backend/requirements.txt`
3. Start app: `backend/.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend`
4. Start frontend: `cd frontend && npm install && npm run dev -- --host 0.0.0.0`
5. Open the frontend URL in the browser.

## Notes

- TensorFlow-based food recognition is included as an optional pipeline, but the app falls back to a safe confirmation flow when a local compatible model is not available.
- OCR and freshness estimates are clearly labeled as estimates and require user confirmation.
- Core workflow works locally without internet access once dependencies are installed.
