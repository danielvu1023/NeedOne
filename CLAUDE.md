# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Commands
- `npx prisma db seed` - Seed database using prisma/seed.ts
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **UI**: React 19, TailwindCSS, shadcn/ui components
- **Real-time**: Supabase subscriptions
- **PWA**: Progressive Web App with manifest.json and service worker

### Database Architecture

The application uses dual database schemas:
- `auth` schema: Supabase authentication tables (users, sessions, etc.)
- `public` schema: Application-specific tables

#### Core Models (public schema):
- `profile` - User profile data linked to auth.users
- `park` - Physical locations/courts
- `check_in` - User check-ins to parks with timestamps
- `park_users` - Many-to-many relationship between users and parks
- `friendships` - Friend relationships (ordered user IDs for consistency)
- `friend_requests` - Pending friend requests with status tracking
- `reports` - User-generated reports

#### Key Relationships:
- Users have one profile linked via auth.users.id
- Users can check into multiple parks
- Friend system uses ordered IDs (user_id_1 < user_id_2) for consistency

### Project Structure

#### App Router (app/)
- Server-side pages with actions in separate files
- `actions.ts` files contain server actions for each feature
- Authentication required for most routes (handled via middleware)

#### Key Directories:
- `utils/supabase/` - Supabase client configurations (client, server, middleware)
- `lib/` - Database types, utilities, and shared types
- `components/` - Reusable UI components organized by feature
- `prisma/` - Database schema and seed file
- `app/generated/prisma/` - Generated Prisma client (custom output location)

### Authentication Flow
- Google One-Tap authentication integrated
- Supabase middleware handles session management
- Server actions check authentication before database operations
- Redirects to `/login` for unauthenticated users

### Friend System Implementation
- Uses ordered user IDs in friendships table for consistency
- Friend requests track sender/receiver and status (pending/accepted/declined)
- RPC function `accept_friend_request` ensures atomic operations
- Prevents duplicate requests and self-requests

### Database Connection
- Prisma client generated to `app/generated/prisma/`
- Uses connection pooling with directUrl for optimal performance
- Multi-schema setup for auth and public data

### PWA Features
- Web app manifest configured
- Service worker for offline capabilities
- Push notifications infrastructure ready

## Important Patterns

### Server Actions
- All database operations use server actions with proper error handling
- Authentication checks at the start of each action
- Path revalidation after mutations
- Consistent error response format using ApiResponse types

### Type Safety
- Database types generated from Prisma schema
- Shared types in lib/types.ts for API responses
- TypeScript strict mode enabled

### Styling
- TailwindCSS with custom configuration
- shadcn/ui components in components/ui/
- Geist font family for typography

### Error Handling
- Database errors logged to console
- User-friendly error messages returned to client
- Proper HTTP status handling in API responses