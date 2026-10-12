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

Prerequisites: Python 3.12, Node.js 22.12 or newer, and Git.

1. Make sure you have accepted the GitHub invitation to this private repository.
2. Clone the project:

	```powershell
	git clone https://github.com/vannirajann/AI-leftover-food-planner.git
	cd AI-leftover-food-planner
	```

3. Run `scripts\start.bat`. On first launch it creates the Python environment and installs the backend and frontend dependencies.
4. Open http://localhost:5173 and sign in with the demo account below.
5. To stop the app, run `powershell -ExecutionPolicy Bypass -File .\scripts\stop.ps1`.

## Share the live demo

To let friends open the website without access to this private repository, deploy the public demo using the [deployment guide](docs/deployment.md).

## Notes

- TensorFlow-based food recognition is included as an optional pipeline, but the app falls back to a safe confirmation flow when a local compatible model is not available.
- OCR and freshness estimates are clearly labeled as estimates and require user confirmation.
- Core workflow works locally without internet access once dependencies are installed.
