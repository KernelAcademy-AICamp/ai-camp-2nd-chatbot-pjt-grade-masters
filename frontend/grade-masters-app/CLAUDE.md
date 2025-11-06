# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Grade Masters** frontend application - a Next.js-based web interface for an LLM-powered learning assistant chatbot. The service helps students with document summarization, Q&A generation, practice problem creation, and learning resource recommendations.

**Parent Project:** LLM API를 활용한 학습 보조 챗봇 개발 (Learning Assistant Chatbot)
- Frontend: Next.js (this repository)
- Backend: FastAPI (separate service)
- LLM APIs: OpenAI GPT-4o, Anthropic Claude 3

## Development Commands

### Running the Development Server
```bash
npm run dev
```
The server runs on **port 8080** (not the default 3000). Access at `http://localhost:8080`.

### Building for Production
```bash
npm run build
```

### Starting Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Architecture & Technical Details

### Framework Configuration
- **Next.js 16.0.1** with App Router (not Pages Router)
- **React 19.2.0** with TypeScript
- **Tailwind CSS v4** with PostCSS
- **Path Alias:** `@/*` maps to project root

### Project Structure
```
app/
├── layout.tsx       # Root layout with Geist fonts, metadata
├── page.tsx         # Home page component
├── globals.css      # Global styles with Tailwind
└── favicon.ico

public/              # Static assets (SVG logos, images)
```

### TypeScript Configuration
- **Target:** ES2017
- **JSX Transform:** `react-jsx` (automatic, no React import needed)
- **Module Resolution:** bundler mode
- **Strict Mode:** Enabled

### Styling Approach
- **Tailwind CSS v4** (newer version with different conventions)
- **CSS Variables:** Geist Sans (`--font-geist-sans`), Geist Mono (`--font-geist-mono`)
- **Dark Mode:** Configured with `dark:` variants
- **Responsive Design:** Mobile-first approach with `sm:`, `md:` breakpoints

## Key Conventions

### Component Patterns
- **Server Components by default** (App Router behavior)
- Use `"use client"` directive only when client-side interactivity is needed
- Prefer named exports for utilities, default exports for page/layout components

### Import Patterns
- Next.js optimized imports: `next/image`, `next/font/google`
- Absolute imports using `@/` prefix
- No explicit React import needed for JSX (automatic transform)

### Font Optimization
- Fonts loaded via `next/font/google` with automatic optimization
- Variable fonts applied through CSS custom properties
- Subsets: `["latin"]` for optimized loading

## Backend Integration Notes

This frontend is designed to communicate with a FastAPI backend that:
- Processes LLM API calls (OpenAI, Anthropic)
- Handles prompt engineering for summarization, Q&A, problem generation
- Returns structured responses (JSON, bullet formats)

When implementing API calls:
- Backend endpoints should be configurable via environment variables
- Handle loading states for LLM response latency
- Implement error boundaries for API failures
- Consider streaming responses for better UX

## Development Workflow

### Adding New Features
1. Create components in appropriate directories (consider `app/components/` or feature-based routing)
2. Use TypeScript for type safety
3. Leverage Server Components for data fetching when possible
4. Add Client Components only when necessary (forms, interactions, hooks)

### Styling Guidelines
- Use Tailwind utility classes with semantic grouping
- Follow mobile-first responsive design
- Support dark mode for all components
- Use Next.js Image component for optimizations

### State Management Considerations
- Start with React built-in state (useState, useReducer)
- Consider React Context for shared state
- Evaluate external libraries (Zustand, Jotai) only if complexity demands it

## Known Configuration Details

- **Custom Port:** Development server uses port 8080 (not default 3000)
- **React Version:** React 19.2.0 (latest with new features)
- **Tailwind Version:** v4 (significant updates from v3)
- **ESLint:** Next.js config with `eslint-config-next`
