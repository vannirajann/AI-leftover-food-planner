# Architecture overview

The project uses a thin-client browser frontend and a local FastAPI service with SQLite.

## Layers

- Frontend: React + TypeScript + Tailwind for interactions and dashboard screens.
- API: FastAPI endpoints for auth, pantry, recipes, shopping, analytics, OCR, and scanning.
- Persistence: SQLite with SQLAlchemy models.
- AI: local detection pipeline using optional model support and a transparent manual fallback.

## Workflow

1. User registers or logs in.
2. Pantry data is persisted per user in SQLite.
3. The scanner can recognize common ingredients or ask for manual confirmation.
4. Recipes are suggested using pantry matching logic.
5. Missing ingredients are added to a shopping list.
6. Meal plans, expiry alerts, and analytics update from the same local data sources.
