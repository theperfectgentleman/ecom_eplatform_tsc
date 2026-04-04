# Encompas E-Platform

The Encompas E-Platform is the web client for operational and administrative workflows across the Encompas health system. It provides browser-based access to dashboards, patient views, referrals, reporting, and related staff tools.

## Overview

This repository contains the frontend application used by authorized platform users to access and manage web-based healthcare workflows. It is built as a React and TypeScript single-page application and integrates with the Encompas API.

## Core Capabilities

- Dashboard and reporting interfaces
- Patient overview and patient snapshot workflows
- Referral and appointment-related screens
- Administrative views and navigation structure
- Responsive browser-based interface for desktop and mobile access

## Technology Stack

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI and related component libraries

## Documentation

Supporting project documentation is available in [docs](./docs/).

- [Training manual](./docs/TRAINING_MANUAL.md)
- [Technical whitepaper](./docs/TECHNICAL_WHITEPAPER.md)
- [Dashboard integration guide](./docs/DASHBOARD_INTEGRATION_GUIDE.md)
- [Project progress report](./docs/PROJECT_PROGRESS_REPORT.md)

## Getting Started

### Prerequisites

- Node.js compatible with the current toolchain
- npm

### Local Setup

```bash
npm install
npm run dev
```

Use environment-specific configuration for API endpoints and deployment settings. Do not hardcode secrets, tokens, or private service URLs into source files.

## Build and Quality Commands

- `npm run dev` starts the development server
- `npm run lint` runs ESLint
- `npm run build:no-version` creates a production build without changing the package version
- `npm run build` creates a production build and increments the patch version
- `npm run preview` serves the built output locally
- `npm test` runs the Playwright test suite

## Repository Structure

- [src](./src) application source code
- [src/pages](./src/pages) feature pages and route-level screens
- [src/components](./src/components) reusable UI and layout components
- [docs](./docs) implementation notes, guides, and reports

## Security and Data Handling

- Keep credentials and deployment configuration outside source control.
- Avoid embedding private API endpoints, tokens, or operator-specific instructions in public-facing documentation.
- Treat user permissions, session handling, and data exposure in the UI as part of the platform's operational security requirements.
