# Copilot Instructions — Mini Request Tracker

## 1. Project Overview

This is a Junior Fullstack Developer test assignment: Mini Request Tracker.

The application allows users to manage requests (tickets).

### Technology Stack

- Frontend: React, TypeScript, Vite.
- Backend: Node.js, Express, TypeScript.
- State management: Zustand.
- Routing: React Router.
- Data storage: JSON file on the backend.
- Shared types: TypeScript module in the `shared/` directory.

### Project Structure

- `client/` — frontend application.
- `server/` — backend application.
- `shared/` — shared TypeScript types and constants.
- `.github/` — AI agent instructions.

The project scaffold has already been created. Do not recreate it.

## 2. Main Application Requirements

The application must support:

- Displaying a list of requests.
- Filtering requests by status.
- Creating a new request.
- Viewing request details.
- Updating request status.
- Loading, error, and empty states.
- Updating the UI without a full page reload.

### Request Data Model

A request (internally called `Ticket`) contains:

- `id`: unique string identifier.
- `title`: required string, 3–100 characters after trimming.
- `description`: optional string, maximum 1000 characters after trimming. Empty strings are allowed.
- `status`: one of `new`, `in_progress`, `closed`.

The server assigns the initial status `new`.

## 3. Architecture Rules

### Frontend

- React components must not make HTTP requests directly.
- Keep API communication in a separate API layer.
- Use Zustand for shared application state.
- Use React local state for component-specific UI state.
- Use React Router for navigation.
- Use the existing Vite setup and `/api` proxy when implemented.

### Backend

- Keep HTTP routes separate from business logic and data storage.
- Keep file operations inside the repository layer.
- Express routes must not directly read or write JSON files.
- Validate incoming data on the backend.
- Return appropriate HTTP status codes and meaningful errors.

### Data Storage

- Store requests in a JSON file on the server.
- Never use localStorage for request persistence.
- Serialize concurrent mutations to prevent lost updates.
- Use a temporary file and atomic rename when writing data.

### Shared Code

- Reuse types and constants from `shared/ticket.ts`.
- Do not duplicate shared type definitions in the frontend or backend.
- Preserve the existing `@shared` alias configuration.

## 4. Coding Standards

- Use TypeScript strict mode.
- Prefer clear, readable and maintainable code.
- Avoid `any` unless absolutely necessary.
- Avoid unnecessary abstractions and overengineering.
- Do not install additional dependencies without a clear reason.
- Follow the existing project conventions.
- Handle errors explicitly.
- Do not silently ignore errors.
- Keep functions focused on a single responsibility.

## 5. AI Agent Working Rules

1. Always inspect the existing code before modifying it.
2. Never recreate or replace the existing project scaffold.
3. Work in small, clearly defined stages.
4. Modify only files relevant to the current task.
5. Do not implement features outside the current task.
6. Do not proceed to the next stage without explicit user approval.
7. Explain important architectural and technical decisions.
8. After each stage, list all created and modified files.
9. Run relevant TypeScript checks and build commands.
10. Never claim that a command or test succeeded unless it was actually executed successfully.
11. If an existing implementation has a problem, explain it before making broad changes.
12. Prefer simple solutions that a Junior Developer can understand and explain.

## 6. Important Project Decisions

- The internal entity name is `Ticket`, not `Request`, to avoid confusion with Express `Request`.
- UI routes will use `/requests`, `/requests/new`, and `/requests/:id`.
- Backend API endpoints will use `/api/tickets`.
- Ticket statuses are `new`, `in_progress`, and `closed`.
- Status transitions are unrestricted: any status can change to any other status.
- The backend is the source of truth for persisted request data.

## 7. Development Workflow

Implement the project in the following order:

1. JSON repository.
2. Express API and backend validation.
3. Frontend API layer and Zustand store.
4. React Router pages and UI.
5. Integration, testing, error handling and README.

Do not start a later stage until the user approves the previous stage.

The user is learning fullstack development. Explanations should be clear, practical and concise. The goal is not only to produce working code, but also to ensure the user understands and can explain the implementation during a technical interview.