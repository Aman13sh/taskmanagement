# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack Kanban task management board application with separate backend (Express.js + TypeScript) and frontend (React + Vite) applications in a monorepo structure.

## Common Development Commands

### Backend Development
```bash
# Start MongoDB (required first)
cd backend && docker-compose up -d

# Install dependencies
cd backend && npm install

# Start development server with auto-reload
cd backend && npm start

# Build TypeScript to JavaScript
cd backend && npm run build

# Production build output
cd backend && node dist/index.js
```

### Frontend Development
```bash
# Install dependencies
cd frontend && npm install

# Start development server (port 5173)
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# Run ESLint
cd frontend && npm run lint

# Preview production build
cd frontend && npm run preview
```

## Architecture Overview

### Backend Architecture

The backend follows a layered MVC-style architecture:

1. **Entry Point** (`src/index.ts`): Express server initialization, middleware setup, and route mounting
2. **Routes Layer** (`src/routes/`): Define API endpoints and map to controllers
3. **Controller Layer** (`src/controller/`): Business logic and request/response handling
4. **Middleware Layer** (`src/middleware/`): Authentication and authorization checks
5. **Model Layer** (`src/models/`): Mongoose schemas defining data structure
6. **Config Layer** (`src/config/`): Database connection and indexing setup

**Authentication Flow**:
- JWT-based with access tokens (15m) and refresh tokens (7d)
- Refresh tokens stored in MongoDB for revocation capability
- Bearer token validation middleware protects routes
- Project access middleware validates user permissions

### Frontend Architecture

The frontend uses React with TypeScript and follows a component-based structure:

1. **API Layer** (`src/api/`): Centralized Axios instance and API calls
2. **Components** (`src/componets/`): React components organized by feature
   - Note: Directory has typo "componets" instead of "components"
3. **Redux Setup** (`src/redux/`): Currently empty, state management not implemented
4. **Styling**: Tailwind CSS with Vite plugin integration

**Key Architectural Decisions**:
- Vite for fast development and optimized builds
- React Compiler (Babel plugin) enabled for optimization
- TypeScript strict mode across both applications
- Separate API layer for clean separation of concerns

### Data Model Relationships

```
User (1) ──┬──> (N) Project (owner)
           └──> (N) Project (member with role)

Project (1) ──> (N) Column
Project (1) ──> (N) Task

Column (1) ──> (N) Task (ordered within column)
```

## Development Environment Setup

### Prerequisites
- Node.js and npm
- Docker and Docker Compose (for MongoDB)

### Environment Variables
Backend requires `.env` file with:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Access token secret
- `JWT_REFRESH_SECRET`: Refresh token secret

### API Communication
- Backend runs on port 3000
- Frontend dev server runs on port 5173
- CORS configured to accept requests from both ports
- Frontend API client configured with base URL `http://localhost:3000`

## Important Notes

1. **No Test Framework**: Testing is not configured. Consider adding Jest/Vitest when implementing tests.

2. **Redux Not Implemented**: Redux directory exists but state management is not set up. Current components use local state.

3. **TypeScript Strict Mode**: Both applications use strict TypeScript configuration. Ensure all new code follows strict typing.

4. **Database Indexing**: Custom indexes are defined in `backend/src/config/indexingfordb.ts` for performance optimization.

5. **Token Management**: Access tokens expire in 15 minutes, refresh tokens in 7 days. Frontend should handle token refresh automatically.

6. **Project Access Control**: `projectaccess.middleware.ts` validates user permissions for project operations based on membership and roles.