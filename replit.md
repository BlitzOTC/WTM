# replit.md

## Overview

This is a full-stack nightlife and event discovery application built with a modern TypeScript stack. The app allows users to search for real-time events in any city worldwide, filter by preferences, create personalized night plans, and host their own events. It features a React frontend with shadcn/ui components, an Express.js backend with RESTful APIs, Google Places API integration for location autocomplete and real-time event generation, and uses Drizzle ORM for database management with PostgreSQL.

## Recent Changes (September 3, 2025)

- **Personalized Event Recommendations**: Added smart recommendations section on search page based on user's onboarding preferences (interests, budget, etc.)
- **Profile Interest Tags**: Added colored interest badges to user profiles showing selected event preferences from onboarding
- **Complete Onboarding Funnel**: Built 5-step user preference collection flow after signup (age, location, frequency, interests, preferences)
- **Enhanced Authentication**: Added functional social login (Google/Apple) and guest access option to login page
- **Streamlined Signup**: Removed location field from signup form - now prompts for location permission within app
- **Authentication System**: Implemented comprehensive login/signup page with form validation and social login options
- **Friend Management System**: Created complete friend search, profiles, and detailed activity pages with unique data per user
- **Social Features Enhancement**: Added clickable friend names, follow functionality, and comprehensive profile statistics
- **UI/UX Improvements**: Fixed LastPass interference, enhanced search functionality, and streamlined navigation
- **Google Places API Integration**: Added real-time autocomplete for city/location search using Google Places API
- **Location-Based Event Generation**: Implemented dynamic event creation based on searched location with realistic venue names and event types

## User Preferences

Preferred communication style: Simple, everyday language.
UI/UX Preferences: 
- No duplicate dollar signs in price displays - use DollarSign icon + number format consistently
- 12-hour time format throughout the application
- Clean, consistent pricing displays with DollarSign icon when showing monetary values

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation using @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful APIs with structured error handling and logging
- **Request Processing**: Express middleware for JSON parsing, URL encoding, and request logging
- **Development**: Hot reloading with Vite integration in development mode

### Data Layer
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Shared TypeScript schema definitions between frontend and backend
- **Validation**: Zod schemas for runtime validation and type inference
- **Storage Interface**: Abstract storage interface with in-memory implementation for development

### Database Schema
- **Users Table**: Authentication and user profile data with support for venue owners
- **Events Table**: Comprehensive event information including location, pricing, categories, and metadata
- **Night Plans Table**: User-created event collections with budget tracking and route optimization

### API Structure
- **Event Management**: CRUD operations for events with advanced filtering (location, price, categories, age requirements)
- **User Management**: User creation and retrieval endpoints
- **Night Planning**: Personal event collection management with budget and route optimization features
- **Validation**: Request validation using Zod schemas with proper error responses

### Authentication & Authorization
- Currently implements basic user management structure
- Support for different user types (regular users vs venue owners)
- Session-based architecture preparation with cookie handling utilities

### Development & Build
- **Development**: Concurrent frontend and backend development with Vite HMR
- **Build Process**: Separate frontend (Vite) and backend (esbuild) build pipelines
- **Type Safety**: Shared TypeScript configurations and path aliases
- **Code Quality**: Strict TypeScript configuration with comprehensive error checking

### UI/UX Design
- **Design System**: Custom design tokens with support for light/dark themes
- **Responsive Design**: Mobile-first approach with breakpoint-aware components
- **Component Architecture**: Modular component structure with proper separation of concerns
- **User Interactions**: Comprehensive modal system for event details and form submissions

## External Dependencies

### Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon database
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **drizzle-kit**: Database migration and schema management tools

### UI & Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant handling for components
- **clsx**: Conditional CSS class utility

### State Management & Data Fetching
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Integration between React Hook Form and validation libraries

### Validation & Type Safety
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Development Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **tsx**: TypeScript execution engine for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

### Additional Utilities
- **date-fns**: Modern JavaScript date utility library
- **nanoid**: URL-safe unique string ID generator
- **embla-carousel-react**: Touch-friendly carousel component
- **cmdk**: Command palette component for search interfaces