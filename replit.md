# Overview

This is a bus display system application built with React and Express, designed to show real-time bus information at bus stations. The application features a digital LED-style display showing bus schedules, arrival times, and announcements in both English and Punjabi. It's built as a full-stack application with a React frontend and Express backend, using PostgreSQL for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Comprehensive set of Radix UI primitives wrapped with shadcn/ui for accessibility
- **Design System**: LED display theme with custom CSS variables for digital bus station aesthetics

## Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API
- **Database Integration**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Data Storage**: In-memory storage with plans for PostgreSQL integration via Neon Database
- **API Design**: RESTful endpoints for buses and announcements with proper HTTP status codes
- **Middleware**: Custom logging middleware for API request monitoring and error handling

## Data Storage
- **Primary Database**: PostgreSQL with Neon Database serverless integration
- **ORM**: Drizzle ORM for type-safe database queries and migrations
- **Schema Management**: Centralized schema definitions with Zod validation
- **Migrations**: Drizzle Kit for database schema migrations and version control
- **Development Storage**: In-memory storage with sample data for development and testing

## Key Features
- **Real-time Updates**: Automatic ETA updates and data refreshing every 30 seconds
- **Bilingual Support**: English and Punjabi language support for announcements
- **Bus Status Tracking**: Multiple status types (on-time, arriving, delayed) with color-coded indicators
- **LED Display Styling**: Digital bus station aesthetic with monospace fonts and LED color scheme
- **Responsive Design**: Mobile-friendly interface with proper viewport handling

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and query building

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **shadcn/ui**: Pre-built component library with consistent design system
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

## Runtime Dependencies
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing for single-page application navigation
- **React Hook Form**: Form handling with validation
- **Date-fns**: Date and time manipulation utilities
- **Zod**: Runtime type validation for API requests and responses