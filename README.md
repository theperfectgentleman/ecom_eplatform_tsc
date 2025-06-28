# Encompas E-Platform

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
AI-Powered Engagement: Delivers personalized insights, reminders, and educational material.
Teleconsultation Management: Streamlines remote appointments and follow-ups.
Secure and Scalable: Ensures patient data privacy and supports multiple users.
## Vision
By combining e-platform capabilities with AI and telemedicine, this project demonstrates how digital tools can transform pregnancy care. The goal is to provide accessible, efficient, and intelligent support for both patients and healthcare providers, paving the way for improved maternal health outcomes globally.
