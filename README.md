# 🎯 SkillExchange

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0.0-green.svg)](https://mongodb.com/)

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.18.2-000000?style=for-the-badge&logo=express&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.14-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6.0-010101?style=for-the-badge&logo=socket.io&logoColor=white)

A comprehensive skill exchange platform that connects people who want to learn and teach skills. Built with modern web technologies, SkillExchange facilitates meaningful skill-sharing experiences through an intuitive interface and robust backend infrastructure.

## 🏷️ Tags

`skill-exchange` `learning-platform` `react` `nodejs` `mongodb` `express` `socket-io` `tailwindcss` `vite` `jwt` `real-time-chat` `user-matching` `skill-sharing` `education` `collaboration` `full-stack` `modern-web` `responsive-design` `dark-mode` `accessibility` `admin-dashboard` `rating-system` `file-upload` `email-service` `rest-api` `web-sockets` `authentication` `authorization` `middleware` `validation` `testing` `deployment` `cloudinary` `nodemailer` `bcryptjs` `helmet` `cors` `multer` `winston` `jest` `eslint` `radix-ui` `react-query` `framer-motion` `react-hook-form` `zod` `axios` `spa` `pwa` `component-library` `state-management` `form-validation` `animation` `modern-ui` `es6` `postcss` `autoprefixer`

## 🌟 Features

### 🔐 User Management
- **Secure Authentication** - JWT-based authentication with email verification
- **Profile Management** - Comprehensive user profiles with skills and availability
- **Skill Matching** - Intelligent algorithm to match users with complementary skills
- **Rating System** - Review and rate completed skill exchanges

### 🎓 Skill Exchange
- **Skill Discovery** - Browse skills by categories (Technology, Languages, Arts & Crafts, etc.)
- **Exchange Requests** - Send and manage skill exchange requests
- **Session Scheduling** - Plan and schedule learning sessions
- **Progress Tracking** - Track exchange status and completion

### 💬 Real-time Communication
- **Live Chat** - Socket.IO powered real-time messaging
- **Notifications** - Instant notifications for exchange updates
- **Online Status** - See when users are available for chat

### 👨‍💼 Admin Features
- **User Management** - Admin dashboard for user oversight
- **Skill Management** - Add, edit, and manage skill categories
- **Analytics** - Platform usage statistics and insights

### 📱 Modern UI/UX
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Dark/Light Theme** - Automatic theme switching
- **Accessible Components** - Built with Radix UI for accessibility
- **Smooth Animations** - Enhanced user experience with Framer Motion

## 🏗️ Architecture

```
SkillExchange/
├── Frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── api/          # API client configurations
│   │   ├── hooks/        # Custom React hooks
│   │   └── contexts/     # React contexts
│   └── package.json
├── Backend/           # Node.js API server
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middlewares/  # Custom middleware
│   │   └── utils/        # Utility functions
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **TanStack React Query** - Server state management
- **Socket.IO Client** - Real-time communication
- **React Hook Form + Zod** - Form handling and validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB + Mongoose** - Database and ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Cloudinary** - Image storage and management
- **Nodemailer** - Email service integration

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SkillExchange.git
   cd SkillExchange
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   
   # Create .env file with your configuration
   cp .env.example .env
   # Edit .env with your database and API keys
   
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   
   # Create .env file
   echo "VITE_API_URL=http://localhost:8080/api" > .env
   echo "VITE_SOCKET_URL=http://localhost:8080" >> .env
   
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8080`
   - API Health Check: `http://localhost:8080/health`

## 📋 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb:// link

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Client Configuration
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```

## 🎮 Usage

### For Users
1. **Register** - Create an account with email verification
2. **Complete Profile** - Add skills you can teach and want to learn
3. **Discover** - Browse users with complementary skills
4. **Connect** - Send exchange requests to potential teachers/learners
5. **Learn** - Schedule sessions and track your progress
6. **Review** - Rate and review completed exchanges

### For Administrators
1. **Dashboard** - Monitor platform activity and user engagement
2. **User Management** - Oversee user accounts and activity
3. **Skill Management** - Add new skill categories and manage existing ones
4. **Analytics** - View platform statistics and growth metrics

## 🚀 Deployment

### Frontend Deployment
```bash
cd Frontend
npm run build
# Deploy the 'dist' folder to your hosting service
```

**Recommended Platforms:**
- Vercel (recommended for React)
- Netlify
- AWS S3 + CloudFront

### Backend Deployment
```bash
cd Backend
npm start
```

**Recommended Platforms:**
- Heroku
- AWS EC2
- DigitalOcean
- Railway

### Database Setup
- **Development**: Local MongoDB instance
- **Production**: MongoDB Atlas (recommended)

## 🧪 Testing

### Backend Testing
```bash
cd Backend
npm test
```

### Frontend Testing
```bash
cd Frontend
npm run lint
```

## 📊 API Documentation

The backend provides a comprehensive REST API with the following main endpoints:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Skills**: `/api/skills/*`
- **Exchanges**: `/api/exchanges/*`
- **Chat**: `/api/chat/*`
- **Reviews**: `/api/reviews/*`
- **Admin**: `/api/admin/*`

For detailed API documentation, see the [Backend README](Backend/README.md).

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Express.js** - For the robust web framework
- **MongoDB** - For the flexible database solution
- **Tailwind CSS** - For the utility-first CSS framework
- **Radix UI** - For accessible component primitives

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/SkillExchange/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/SkillExchange/discussions)
- **Email**: support@skillexchange.com

## 🔮 Roadmap

- [ ] Mobile app development (React Native)
- [ ] Video call integration
- [ ] Advanced matching algorithms
- [ ] Skill certification system
- [ ] Multi-language support
- [ ] Payment integration for premium features

---

**Built with ❤️ by the SkillExchange Team**

*Connect. Learn. Grow.*
