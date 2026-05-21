# SkillExchange Backend

A robust Node.js backend API for the SkillExchange platform, providing comprehensive functionality for user management, skill exchanges, real-time communication, and administrative features.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.18.2-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6.0-010101?style=for-the-badge&logo=socket.io&logoColor=white)

## 🏷️ Tags

`nodejs` `express` `mongodb` `mongoose` `socket-io` `jwt` `bcryptjs` `helmet` `cors` `multer` `cloudinary` `nodemailer` `winston` `jest` `supertest` `eslint` `nodemon` `rest-api` `real-time` `authentication` `authorization` `file-upload` `email-service` `rate-limiting` `security` `middleware` `validation` `error-handling` `logging` `testing` `backend` `api` `server` `database` `web-sockets` `skill-exchange` `user-management` `admin-panel`

## 🚀 Overview

The SkillExchange backend is a full-featured REST API built with Node.js and Express, designed to handle user authentication, skill management, exchange requests, real-time chat, and administrative operations. It provides a secure, scalable foundation for the skill exchange platform.

## 🛠️ Tech Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js 4.18.2** - Web application framework
- **MongoDB 8.0.0** - NoSQL database with Mongoose ODM
- **Socket.IO 4.6.0** - Real-time bidirectional communication

### Security & Authentication
- **JWT (jsonwebtoken)** - JSON Web Token authentication
- **bcryptjs** - Password hashing and verification
- **Helmet** - Security headers middleware
- **CORS** - Cross-origin resource sharing
- **express-mongo-sanitize** - MongoDB injection prevention

### File Handling & Storage
- **Multer** - File upload middleware
- **Cloudinary** - Cloud-based image storage and management

### Communication & Notifications
- **Nodemailer** - Email service integration
- **Winston** - Logging framework

### Development & Testing
- **Nodemon** - Development server with auto-restart
- **Jest** - Testing framework
- **Supertest** - HTTP assertion testing
- **ESLint** - Code linting and formatting

## 📁 Project Structure

```
Backend/
├── src/
│   ├── app.js              # Express application setup
│   ├── config/             # Configuration files
│   │   ├── database.js     # MongoDB connection
│   │   ├── cloudinary.js   # Cloudinary configuration
│   │   └── socket.js       # Socket.IO setup
│   ├── controllers/        # Route controllers
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── skillController.js   # Skills management
│   │   ├── exchangeController.js # Exchange requests
│   │   ├── chatController.js    # Chat functionality
│   │   ├── reviewController.js  # Review system
│   │   ├── adminController.js   # Admin operations
│   │   ├── notificationController.js # Notifications
│   │   └── publicController.js  # Public endpoints
│   ├── middlewares/        # Custom middleware
│   │   ├── auth.js         # Authentication middleware
│   │   ├── errorHandler.js # Error handling
│   │   ├── rateLimiter.js  # Rate limiting
│   │   ├── upload.js       # File upload handling
│   │   └── validation.js   # Request validation
│   ├── models/            # Database models
│   │   ├── User.js        # User schema
│   │   ├── Skill.js       # Skill schema
│   │   ├── ExchangeRequest.js # Exchange schema
│   │   ├── Chat.js        # Chat schema
│   │   ├── Review.js      # Review schema
│   │   ├── Notification.js # Notification schema
│   │   └── SkillSuggestion.js # Skill suggestion schema
│   ├── routes/            # API routes
│   │   ├── authRoutes.js  # Authentication endpoints
│   │   ├── userRoutes.js  # User management endpoints
│   │   ├── skillsRoutes.js # Skills endpoints
│   │   ├── exchangeRoutes.js # Exchange endpoints
│   │   ├── chatRoutes.js  # Chat endpoints
│   │   ├── reviewRoutes.js # Review endpoints
│   │   ├── adminRoutes.js # Admin endpoints
│   │   ├── notificationRoutes.js # Notification endpoints
│   │   └── publicRoutes.js # Public endpoints
│   ├── utils/             # Utility functions
│   │   ├── emailService.js # Email functionality
│   │   ├── matchingEngine.js # Skill matching logic
│   │   ├── notificationCleanup.js # Cleanup tasks
│   │   └── otpService.js  # OTP generation
│   └── validators/        # Input validation
│       ├── authValidator.js # Auth validation
│       ├── exchangeValidator.js # Exchange validation
│       └── userValidator.js # User validation
├── uploads/               # Local file storage
├── server.js             # Server entry point
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SkillExchange/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the Backend directory:
   ```env
   # Server Configuration
   PORT=8080
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/skillexchange
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@skillexchange.com
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Client Configuration
   CLIENT_URL=http://localhost5173
   
   # OTP Configuration
   OTP_EXPIRE_MINUTES=10
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify installation**
   Visit `http://localhost:8080/health` to check if the server is running

## 📜 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run cleanup` - Run notification cleanup task
- `npm test` - Run test suite with coverage
- `npm run lint` - Run ESLint for code quality

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset
- `POST /verify-email` - Email verification
- `POST /change-password` - Change password

### Users (`/api/users`)
- `GET /me` - Get current user profile
- `PUT /me` - Update user profile
- `GET /search` - Search users by skills
- `GET /matches` - Get skill matches
- `GET /:id` - Get user by ID
- `POST /upload-avatar` - Upload profile picture

### Skills (`/api/skills`)
- `GET /` - Get all skills
- `GET /categories` - Get skill categories
- `GET /popular` - Get popular skills
- `POST /suggest` - Suggest new skill
- `GET /search` - Search skills

### Exchanges (`/api/exchanges`)
- `GET /` - Get user exchanges
- `POST /request` - Create exchange request
- `PUT /:id/accept` - Accept exchange
- `PUT /:id/reject` - Reject exchange
- `PUT /:id/complete` - Mark as completed
- `GET /:id` - Get exchange details

### Chat (`/api/chat`)
- `GET /` - Get user chats
- `POST /` - Create new chat
- `GET /:id` - Get chat messages
- `POST /:id/messages` - Send message

### Reviews (`/api/reviews`)
- `GET /` - Get reviews
- `POST /` - Create review
- `GET /:id` - Get review details

### Admin (`/api/admin`)
- `GET /dashboard` - Admin dashboard stats
- `GET /users` - Get all users
- `PUT /users/:id` - Update user status
- `GET /skills` - Manage skills
- `POST /skills` - Add new skill
- `PUT /skills/:id` - Update skill

### Public (`/api/public`)
- `GET /stats` - Public platform statistics
- `GET /featured-skills` - Featured skills

## 🗄️ Database Models

### User Model
- Personal information (name, email, bio)
- Skills to teach and learn with proficiency levels
- Location and availability settings
- Rating system and verification status
- Profile picture and contact information

### Skill Model
- Skill name, category, and description
- Tags for better searchability
- User count and active status
- Text search indexing

### ExchangeRequest Model
- Sender and receiver references
- Skills offered and requested
- Status tracking (pending, accepted, completed)
- Scheduled sessions with time slots
- Chat integration

### Chat Model
- Participants and message history
- Real-time message handling
- Message status and timestamps

### Review Model
- Exchange reference and ratings
- Written feedback and comments
- Reviewer and reviewee information

## 🔒 Security Features

- **Password Hashing** - bcryptjs for secure password storage
- **JWT Authentication** - Stateless authentication with HTTP-only cookies
- **Rate Limiting** - Prevent API abuse
- **Input Sanitization** - MongoDB injection prevention
- **CORS Configuration** - Controlled cross-origin access
- **Security Headers** - Helmet middleware for security headers
- **File Upload Security** - Secure file handling with validation

## 📧 Email Services

The backend includes comprehensive email functionality:
- **Account Verification** - Email verification for new accounts
- **Password Reset** - Secure password reset via email
- **Exchange Notifications** - Notify users of exchange updates
- **System Notifications** - Platform-wide announcements

## 🔄 Real-time Features

- **Socket.IO Integration** - Real-time chat and notifications
- **Online Status** - Track user online/offline status
- **Live Updates** - Real-time exchange status updates
- **Notification System** - Instant notifications for important events

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillexchange
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
# ... other production variables
```

### Deployment Platforms
- **Heroku** - Easy deployment with MongoDB Atlas
- **AWS EC2** - Scalable cloud hosting
- **DigitalOcean** - VPS hosting option
- **Railway** - Modern deployment platform

### Database Setup
- **MongoDB Atlas** - Recommended cloud database
- **Local MongoDB** - For development environment

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test coverage includes:
- API endpoint testing
- Authentication flows
- Database operations
- Error handling
- Security validations

## 📊 Monitoring & Logging

- **Winston Logger** - Structured logging system
- **Error Tracking** - Comprehensive error handling
- **Health Checks** - Server health monitoring
- **Performance Metrics** - API response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write comprehensive tests
- Document API endpoints
- Use meaningful commit messages
- Follow RESTful API conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check API documentation
- Contact the development team

---

**Built with ❤️ using Node.js, Express, and MongoDB**
