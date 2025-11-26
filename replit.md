# VelvetPlay Online

## Overview

VelvetPlay Online is a premium 18+ couples and small-group party game platform featuring spicy games like Truth or Dare, Never Have I Ever, and similar intimate experiences. The application emphasizes a luxury aesthetic with a "velvet + neon + ember" design language, featuring cinematic animations and motion design throughout. The platform supports both local (same-device) and online multiplayer modes, with real-time synchronization for online rooms.

**Target Audience:** Adults 18+ playing in couples or small groups  
**Content Rating:** PG-17 (spicy/flirty/bold but non-explicit)  
**Core Experience:** Turn-based prompt games with adjustable intensity levels and customizable settings

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The application uses a unified monorepo with three main sections:
- `/client` - React-based frontend application
- `/server` - Express.js backend API and WebSocket server
- `/shared` - Shared TypeScript types and validation schemas

**Rationale:** Monorepo structure enables type sharing between frontend and backend, reducing duplication and ensuring consistency. All code lives in a single Replit project for simplified deployment.

### Frontend Architecture

**Core Stack:**
- **React 18 + TypeScript + Vite** - Modern build tooling with fast HMR
- **Wouter** - Lightweight client-side routing (~1KB vs React Router's larger bundle)
- **TanStack Query (React Query)** - Server state management, caching, and data fetching
- **Zustand** - Local state management (game state, user preferences) with persistence

**UI Framework:**
- **Tailwind CSS** - Utility-first styling with custom design system
- **shadcn/ui (Radix UI primitives)** - Accessible component primitives, heavily customized for velvet/neon aesthetic
- **Framer Motion** - Animation library for page transitions, card flips, heat meter pulses, and tool animations

**Design System:**
Custom theme extending Tailwind with brand-specific colors (Velvet Red, Noir Black, Deep Plum, Ember Orange, Neon Magenta). All UI components follow the luxury aesthetic defined in `design_guidelines.md` with 3D effects, glows, and layered gradients.

**PWA Support:**
Progressive Web App configuration with manifest and service worker setup for offline capability in local mode.

### Backend Architecture

**Framework:** Express.js with TypeScript  
**HTTP Server:** Node.js 20 with modular route structure

**API Design:**
RESTful endpoints for:
- Game/pack/prompt CRUD operations
- Room creation and management
- Player management

**Real-time Communication:**
- **WebSocket Server (ws library)** mounted at `/ws` path
- Room-based message broadcasting for multiplayer synchronization
- Connection management with room/player mapping

**Rationale:** Express provides lightweight, flexible routing. WebSockets enable real-time multiplayer without Firebase dependency. Clean separation between HTTP (state changes) and WS (live updates) concerns.

### Data Storage

**ORM:** Drizzle ORM with PostgreSQL dialect  
**Database:** PostgreSQL (via Neon serverless)  
**Schema Location:** `/shared/schema.ts` (shared between frontend and backend)

**Database Schema:**
- `users` - Admin authentication
- `games` - Game types (Truth or Dare, Never Have I Ever, etc.)
- `packs` - Content packs within games (categories/themes)
- `prompts` - Individual questions/dares/challenges with intensity levels and flags
- `rooms` - Online multiplayer room state
- `room_players` - Players within rooms
- `room_turns` - Turn history tracking

**In-Memory Storage Fallback:**
The application includes a memory-based storage implementation for development/offline scenarios, implementing the same `IStorage` interface as the database version.

**Rationale:** Drizzle provides type-safe queries with minimal overhead. Schema defined in TypeScript enables compile-time validation. Neon serverless offers PostgreSQL compatibility without infrastructure management.

### State Management Strategy

**Client-Side State:**
1. **Server State (TanStack Query)** - API data, games, prompts, automatic caching
2. **Local Game State (Zustand + localStorage)** - Current game progress, player turns, heat levels
3. **Online Room State (Zustand + WebSocket)** - Real-time multiplayer synchronization
4. **Age Verification (Zustand + localStorage)** - Persistent age gate bypass

**Game Flow State Machine:**
- Local: `setup → playing → summary`
- Online: `setup → lobby → playing → summary`

### Authentication & Authorization

**Age Verification:**
Simple age gate with localStorage persistence. No account creation required for players.

**Admin Access:**
Username/password authentication for content management (creating games, packs, prompts). Session-based authentication using express-session.

**Guest Players:**
Online multiplayer supports anonymous players with auto-generated IDs and nicknames.

**Rationale:** Minimal friction for casual party game players. Admin system protects content management without complicating player experience.

### Build & Deployment

**Development:**
- Vite dev server with HMR at `/vite-hmr`
- Express middleware mode for API/WebSocket integration
- TypeScript compilation with path aliases

**Production:**
- Client: Vite build → static files in `dist/public`
- Server: esbuild bundle → single `dist/index.cjs` with selected dependencies bundled
- Serving: Express serves static files + API + WebSocket on single port

**Scripts:**
- `npm run dev` - Development server with live reload
- `npm run build` - Production build (both client and server)
- `npm run start` - Run production build
- `npm run db:push` - Push Drizzle schema to database

## External Dependencies

### Database & ORM
- **@neondatabase/serverless** - Neon PostgreSQL serverless driver
- **drizzle-orm** - Type-safe ORM for database queries
- **drizzle-zod** - Zod schema generation from Drizzle schemas
- **connect-pg-simple** - PostgreSQL session store for Express

### UI & Animation
- **@radix-ui/** (multiple packages) - Accessible component primitives (accordion, dialog, dropdown, etc.)
- **framer-motion** - Animation and gesture library
- **class-variance-authority** - CVA for component variants
- **tailwind-merge** - Tailwind class merging utility
- **cmdk** - Command palette component
- **embla-carousel-react** - Carousel implementation

### Form & Validation
- **react-hook-form** - Form state management
- **@hookform/resolvers** - Form validation resolvers
- **zod** - Schema validation library

### State & Data Fetching
- **@tanstack/react-query** - Server state management
- **zustand** - Client state management
- **ws** - WebSocket server implementation

### Backend Utilities
- **express** - Web framework
- **express-session** - Session middleware
- **express-rate-limit** - Rate limiting
- **cors** - CORS middleware
- **nanoid** - Unique ID generation
- **date-fns** - Date formatting

### Build Tools
- **vite** - Frontend build tool and dev server
- **@vitejs/plugin-react** - React plugin for Vite
- **esbuild** - Server bundler for production
- **tsx** - TypeScript execution for development
- **postcss** - CSS processing
- **autoprefixer** - CSS vendor prefixing

### Development Tools
- **@replit/vite-plugin-runtime-error-modal** - Error overlay for Replit
- **@replit/vite-plugin-cartographer** - Replit integration
- **@replit/vite-plugin-dev-banner** - Development banner

**Note:** The application explicitly avoids Firebase and uses WebSockets + PostgreSQL for all real-time and persistence needs.