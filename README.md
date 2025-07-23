# Encompass E-Platform

A platform to manage health teleconsultation, data on pregnant women, and AI-supported tools for health attendants.

## Features

- 🔐 Firebase Authentication (Email/Password)
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 📱 Responsive design with mobile sidebar
- 🛡️ Permission-based access control (placeholder)
- 🧭 React Router for navigation
- 📊 Dashboard with activity feed
- 🔔 Notification system ready
- ⚡ Built with Vite for fast development

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project (for authentication)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication with Email/Password
   - Copy your Firebase config to `src/App.tsx`

4. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── MainLayout.tsx      # Main application layout
│   └── ui/                     # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx         # Authentication context
├── pages/
│   ├── Dashboard.tsx           # Dashboard page
│   └── LoginPage.tsx           # Login/signup page
├── lib/
│   └── utils.ts                # Utility functions
├── App.tsx                     # Main app component
├── main.tsx                    # Entry point
└── index.css                   # Global styles
```

## Features to Implement

- [ ] Complete permission management system
- [ ] More dashboard widgets
- [ ] User profile management
- [ ] Project management
- [ ] Message system
- [ ] Calendar integration
- [ ] File upload/management
- [ ] Settings page
- [ ] Dark mode toggle

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Authentication**: Firebase Auth
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

# Encompass ePlatform Documentation

## 1. Project Overview

The Encompass ePlatform is a modern, web-based application designed to streamline patient referrals, appointment scheduling, and administrative tasks within a healthcare network. It provides a centralized system for doctors, nurses, and administrative staff to manage patient information, track referrals, and coordinate care. The platform features a user-friendly interface, role-based access control, and a secure backend to ensure data privacy and compliance with healthcare regulations.

## 2. Technical Setup

This section details the technical stack, project structure, and other configurations required to understand and work with the Encompass ePlatform codebase.

### 2.1. Tech Stack

The project is built using a modern and robust technology stack:

- **Frontend:**
    - **React:** A JavaScript library for building user interfaces.
    - **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
    - **Vite:** A fast build tool and development server for modern web projects.
    - **React Router:** For declarative routing in the application.
    - **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
    - **Shadcn/ui:** A collection of reusable UI components.
- **Linting and Formatting:**
    - **ESLint:** For identifying and reporting on patterns found in ECMAScript/JavaScript code.
    - **Prettier:** An opinionated code formatter.
- **Deployment:**
    - **Docker:** For containerizing the application for consistent deployment.
    - **Nginx:** A high-performance web server used to serve the production build.

### 2.2. Project Structure

The project follows a standard structure for a React application, with a clear separation of concerns:

```
/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── config/         # Application configuration (e.g., navigation)
│   ├── contexts/       # React contexts for state management
│   ├── lib/            # Helper functions and utilities
│   ├── pages/          # Top-level page components
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main application component with routing
│   ├── main.tsx        # Entry point of the application
│   └── index.css       # Global CSS styles
├── Dockerfile          # Docker configuration for building the production image
├── nginx.conf          # Nginx configuration for serving the application
├── package.json        # Project dependencies and scripts
└── vite.config.ts      # Vite build and development server configuration
```

### 2.3. API Integration

The frontend application communicates with a backend REST API. The API endpoint is configured in `vite.config.ts` for the development environment. For production, the `VITE_API_BASE_URL` environment variable is used during the Docker build process to set the API endpoint.

The `src/lib/api.ts` file contains the core functions for making API requests, handling responses, and managing errors.

### 2.4. Security

- **Authentication:** The application uses a token-based authentication system. After a user logs in, a JSON Web Token (JWT) is stored in the browser's local storage and sent with each subsequent API request in the `Authorization` header.
- **Protected Routes:** The `src/components/ProtectedRoute.tsx` component ensures that only authenticated users can access certain routes. It checks for the presence of a valid token and redirects unauthenticated users to the login page.
- **Role-Based Access Control (RBAC):** The application implements RBAC to control access to different features and data based on user roles (e.g., admin, doctor, nurse). The user's permissions are fetched from the API and used to conditionally render UI elements and restrict access to certain pages.

## 3. User Guides

This section provides a guide to the different components of the application and how they are used.

### 3.1. Getting Started

To run the project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure the API endpoint:**
   - In `vite.config.ts`, update the `proxy` configuration to point to your local backend server.
4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

### 3.2. Building for Production

To build the application for production, run the following command:

```bash
npm run build
```

This will create a `dist` directory with the optimized and minified production assets.

### 3.3. Deployment

The application is designed to be deployed using Docker. The `Dockerfile` in the root of the project defines the steps to build a production-ready Docker image.

1. **Build the Docker image:**
   ```bash
   docker build -t encompas-eplatform . --build-arg VITE_API_BASE_URL=<your-api-url>
   ```
2. **Run the Docker container:**
   ```bash
   docker run -p 80:80 encompas-eplatform
   ```
   The application will be accessible on port 80 of the host machine.

### 3.4. Key Components

- **`App.tsx`:** The main component that sets up the application's routing and context providers.
- **`MainLayout.tsx`:** The primary layout for the application, including the header, sidebar, and main content area.
- **`LoginPage.tsx`:** The login page where users authenticate.
- **`Dashboard.tsx`:** The main dashboard that users see after logging in.
- **`Referral.tsx`:** The page for creating and managing patient referrals.
- **`Admin.tsx`:** The admin panel for managing users and other system settings.

## 4. Handover Checklist

This checklist is to ensure a smooth handover to a new team:

- [ ] **Code Walkthrough:** A session to walk through the codebase and explain the architecture and key components.
- [ ] **Environment Setup:** Ensure the new team can set up the development environment and run the project locally.
- [ ] **Deployment Process:** Document and demonstrate the process for building and deploying the application to production.
- [ ] **API Documentation:** Provide access to the backend API documentation.
- [ ] **Access to Tools:** Grant access to any necessary tools, such as the Git repository, project management boards, and deployment servers.
- [ ] **Contact Information:** Provide contact information for key personnel for any follow-up questions.
