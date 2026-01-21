# EduHiring - Teacher Application Management System

## Overview

EduHiring is a full-stack web application designed to centralize and streamline the Teacher I Application Process. The system manages the complete workflow from applicant registration through HR evaluation and final assessment, implementing role-based access control for Applicants, HR Secretariat, and ASDS administrators.

The application follows a defined evaluation pipeline: Initial Eligibility Review (IER) → Initial Evaluation Score (IES) → Comparative Assessment Result (CAR), with status tracking throughout the process.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` for route components
- Reusable UI components in `client/src/components/ui/` (shadcn/ui)
- Custom hooks in `client/src/hooks/` for data fetching and authentication
- Shared route definitions and schemas imported from `@shared/`

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Authentication**: Passport.js with Local Strategy, session-based auth
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **API Design**: RESTful endpoints defined in shared route contracts

The backend uses a layered architecture:
- `server/routes.ts` - API route handlers
- `server/storage.ts` - Data access layer abstraction
- `server/auth.ts` - Authentication setup and password hashing
- `server/db.ts` - Database connection configuration

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between frontend/backend)
- **Migrations**: Drizzle Kit with `db:push` command
- **File Uploads**: Multer for document handling, files served from `/uploads`

Key database tables:
- `users` - Authentication with role-based access (user/admin)
- `applicants` - Applicant profiles with personal info and document URLs
- `secretariat` / `asds` - Admin profiles
- `positions` / `schoolsDivisionOffice` - Available positions and locations
- `applicationCodes` - Application submissions with status tracking
- `ier` / `ies` / `car` - Evaluation pipeline records

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Drizzle schema definitions and Zod validation schemas
- `routes.ts` - API contract definitions with input/output schemas

## External Dependencies

### Database
- **PostgreSQL**: Primary database (connection via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Passport.js**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI primitives (via shadcn/ui)
- **react-hook-form**: Form state management
- **zod**: Schema validation (shared with backend)
- **lucide-react**: Icon library
- **recharts**: Data visualization for assessment scores
- **date-fns**: Date formatting utilities

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key (optional, has default for dev)