# SkillExchange Frontend

A modern, responsive React application for the SkillExchange platform that enables users to connect, share skills, and learn from each other through skill exchanges.

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.14-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🏷️ Tags

`react` `vite` `tailwindcss` `radix-ui` `react-query` `socket-io` `framer-motion` `react-hook-form` `zod` `axios` `modern-ui` `responsive-design` `real-time-chat` `skill-exchange` `frontend` `spa` `pwa` `accessibility` `dark-mode` `light-mode` `component-library` `state-management` `form-validation` `animation` `modern-web` `es6` `eslint` `postcss` `autoprefixer`

## 🚀 Overview

The SkillExchange frontend is a comprehensive React application built with modern web technologies. It provides an intuitive user interface for users to discover skills, connect with other users, manage skill exchanges, and communicate through real-time chat functionality.

## 🛠️ Tech Stack

### Core Technologies
- **React 19.1.1** - Modern React with latest features
- **Vite 7.1.7** - Fast build tool and development server
- **React Router DOM 7.9.3** - Client-side routing
- **JavaScript (ES6+)** - Modern JavaScript features

### UI & Styling
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Headless UI** - Unstyled, accessible UI components
- **Framer Motion 12.23.22** - Animation library
- **Lucide React** - Beautiful icon library

### State Management & Data Fetching
- **TanStack React Query 5.90.2** - Server state management
- **Axios 1.12.2** - HTTP client for API requests
- **Socket.IO Client 4.8.1** - Real-time communication

### Forms & Validation
- **React Hook Form 7.64.0** - Form handling
- **Zod 4.1.11** - Schema validation
- **Hookform Resolvers** - Form validation integration

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
Frontend/
├── public/                 # Static assets
├── src/
│   ├── api/               # API client configurations
│   │   ├── client.js      # Axios configuration
│   │   ├── AuthApi.js     # Authentication endpoints
│   │   ├── UserApi.js     # User management
│   │   ├── SkillsApi.js   # Skills management
│   │   ├── ExchangeApi.js # Exchange requests
│   │   ├── ChatApi.js     # Chat functionality
│   │   └── ...
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components (Radix UI)
│   │   ├── chat/         # Chat-specific components
│   │   ├── Navbar.jsx    # Navigation component
│   │   ├── SkillCard.jsx # Skill display component
│   │   └── ...
│   ├── contexts/         # React contexts
│   │   └── ChatContext.jsx # Chat state management
│   ├── hooks/           # Custom React hooks
│   │   ├── useMe.js     # Current user data
│   │   ├── useLogout.js # Logout functionality
│   │   ├── useTheme.js  # Theme management
│   │   └── ...
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── admin/       # Admin dashboard
│   │   ├── chat/        # Chat interface
│   │   ├── exchanges/   # Exchange management
│   │   ├── profile/     # User profile
│   │   └── ...
│   ├── providers/       # Context providers
│   ├── utils/          # Utility functions
│   └── lib/           # Library configurations
├── components.json     # Radix UI configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── vite.config.js     # Vite configuration
└── package.json       # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SkillExchange/Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the Frontend directory:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_SOCKET_URL=http://localhost:8080
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost5173` (or the port shown in terminal)

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-ready application
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 🎨 Key Features

### User Interface
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Dark/Light Theme** - Automatic theme switching
- **Modern UI Components** - Built with Radix UI for accessibility
- **Smooth Animations** - Enhanced UX with Framer Motion

### Core Functionality
- **User Authentication** - Login, registration, password reset
- **Profile Management** - User profiles with skills and availability
- **Skill Discovery** - Browse and search skills by category
- **Skill Matching** - Find users with complementary skills
- **Exchange Management** - Request, accept, and track skill exchanges
- **Real-time Chat** - Socket.IO powered messaging
- **Review System** - Rate and review completed exchanges
- **Admin Dashboard** - User and skill management

### Performance Optimizations
- **Code Splitting** - Lazy loading of page components
- **Bundle Optimization** - Manual chunk splitting for better caching
- **Image Optimization** - Efficient image handling
- **Caching Strategy** - React Query for server state caching

## 🔧 Configuration

### Vite Configuration
The application uses Vite with optimized build settings:
- Manual chunk splitting for better caching
- Source maps for production debugging
- Path aliases for cleaner imports (`@/` for `src/`)

### Tailwind Configuration
Custom Tailwind setup with:
- CSS custom properties for theming
- Extended color palette
- Custom animations and keyframes
- Responsive design utilities

## 🌐 API Integration

The frontend communicates with the backend through:
- **RESTful APIs** - Standard HTTP requests via Axios
- **WebSocket** - Real-time chat and notifications
- **Authentication** - JWT tokens with HTTP-only cookies
- **Error Handling** - Comprehensive error boundary and interceptors

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_SOCKET_URL=https://your-api-domain.com
```

### Deployment Platforms
- **Vercel** - Recommended for React applications
- **Netlify** - Alternative deployment option
- **AWS S3 + CloudFront** - For custom hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Contact the development team

---

**Built with ❤️ using React, Vite, and Tailwind CSS**
