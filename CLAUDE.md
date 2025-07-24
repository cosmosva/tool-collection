# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tool List Application (v0.4.2) - A collection of utility tools built with Next.js 15 App Router, featuring Todo List, Calculator, Markdown processor, and Audio processor tools.

## Essential Commands

### Development
```bash
npm run dev          # Start development server with Turbo
npm run preview      # Build and preview production version
```

### Code Quality
```bash
npm run check        # Run Biome linter
npm run check:write  # Auto-fix linting issues
npm run typecheck    # Check TypeScript types
```

### Build & Deploy
```bash
npm run build        # Create production build
npm start            # Start production server
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **Code Quality**: Biome for linting/formatting
- **Environment**: @t3-oss/env-nextjs with Zod validation

### Key Patterns
1. **App Router Structure**: All routes under `src/app/`, tools in `src/app/tools/[tool-name]/`
2. **Client Components**: Use `"use client"` directive for interactive components
3. **Type Safety**: Strict TypeScript with `noUncheckedIndexedAccess` enabled
4. **Path Aliases**: `@/*` maps to `src/*`
5. **Component Architecture**: Reusable components in `src/components/`

### Tool-Specific Dependencies
- **Markdown Tool**: marked, docx, html2canvas, jspdf for format conversions
- **Audio Tool**: lamejs for MP3 encoding, supports merging and format conversion
- **All Tools**: file-saver for download functionality

### Development Guidelines
1. Each tool should be self-contained in its own route under `/tools/`
2. Use existing UI patterns from ToolCard.tsx and BackButton.tsx
3. Maintain responsive design using Tailwind's responsive utilities
4. Store persistent data in localStorage when appropriate
5. Follow existing code style - Biome will enforce consistent formatting

### Testing Approach
Currently no test framework is configured. When implementing tests, check with the user for preferred testing approach.

## Current Tools

1. **Todo List** (`/tools/todo`) - Task management with localStorage persistence
2. **Calculator** (`/tools/calculator`) - Basic arithmetic operations
3. **Markdown** (`/tools/markdown`) - Preview and multi-format export
4. **Audio** (`/tools/audio`) - Audio merging, extraction, and conversion