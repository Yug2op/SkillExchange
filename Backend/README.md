# Skill Exchange Platform - Backend API

A comprehensive backend API for a skill exchange platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Email verification
  - Password reset functionality
  - Role-based access control (User/Admin)

- **User Profiles**
  - Profile management with bio, skills, location
  - Profile picture upload (Cloudinary)
  - Skills to teach and learn
  - Availability scheduling

- **Smart Matching Engine**
  - Matches users based on complementary skills
  - Scoring algorithm for best matches
  - Similar skill suggestions

- **Exchange Requests**
  - Send/accept/reject exchange requests
  - Session scheduling (online/offline)
  - Request status tracking

- **Real-time Chat**
  - Socket.io integration
  - 1-to-1 messaging
  - Message history
  - Typing indicators
  - Unread message counts

- **Review & Rating System**
  - Post-exchange reviews
  - 5-star rating system
  - Aspect-based ratings (communication, knowledge, etc.)
  - Automatic profile rating updates

- **Admin Panel**
  - User management
  - Dashboard analytics
  - Skill category management
  - Platform statistics

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Cloudinary account (for image uploads)
- Email service (Gmail/SendGrid)

## 🛠️ Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd skill-exchange-api
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` and add your configuration:
- MongoDB URI
- JWT secrets
- Cloudinary credentials
- Email service credentials
- Other settings

4. **Create uploads directory**
\`\`\`bash
mkdir uploads
\`\`\`

5. **Start the server**
\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

The server will start on \`http://localhost:5000\`

## 📁 Project Structure

\`\`\`
skill-exchange-api/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose models
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middlewares
│   ├── validators/      # Request validators
│   ├── utils/           # Utility functions
│   └── app.js           # Express app setup
├── server.js            # Server entry point
├── .env                 # Environment variables
└── package.json
\`\`\`

## 🔌 API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - Login user
- \`GET /api/auth/me\` - Get current user
- \`POST /api/auth/verify-email\` - Verify email
- \`POST /api/auth/forgot-password\` - Request password reset
- \`POST /api/auth/reset-password\` - Reset password
- \`PUT /api/auth/change-password\` - Change password

### Users
- \`GET /api/users/search\` - Search users by skills/location
- \`GET /api/users/matches\` - Get skill matches
- \`GET /api/users/:id\` - Get user profile
- \`PUT /api/users/:id\` - Update profile
- \`POST /api/users/:id/profile-pic\` - Upload profile picture
- \`DELETE /api/users/:id\` - Delete account

### Exchanges
- \`POST /api/exchanges/request\` - Create exchange request
- \`GET /api/exchanges/my\` - Get user's exchanges
- \`GET /api/exchanges/:id\` - Get exchange details
- \`PUT /api/exchanges/:id/accept\` - Accept request
- \`PUT /api/exchanges/:id/reject\` - Reject request
- \`PUT /api/exchanges/:id/cancel\` - Cancel request
- \`POST /api/exchanges/:id/schedule\` - Schedule session
- \`PUT /api/exchanges/:id/complete\` - Mark as completed

### Chat
- \`GET /api/chat\` - Get all chats
- \`GET /api/chat/:id\` - Get chat messages
- \`POST /api/chat/:id/message\` - Send message (HTTP fallback)
- \`GET /api/chat/unread/count\` - Get unread count
- \`DELETE /api/chat/:id\` - Delete chat

### Reviews
- \`POST /api/reviews\` - Create review
- \`GET /api/reviews/:userId\` - Get user's reviews
- \`GET /api/reviews/my/given\` - Get reviews given by user
- \`PUT /api/reviews/:id\` - Update review
- \`DELETE /api/reviews/:id\` - Delete review

### Admin
- \`GET /api/admin/users\` - Get all users
- \`GET /api/admin/stats\` - Get dashboard statistics
- \`PUT /api/admin/users/:id/deactivate\` - Deactivate user
- \`PUT /api/admin/users/:id/activate\` - Activate user
- \`DELETE /api/admin/users/:id\` - Delete user permanently
- \`POST /api/admin/skills\` - Create skill category
- \`GET /api/admin/skills\` - Get all skills

## 🔒 Security Features

- JWT authentication with secure tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- MongoDB injection prevention
- Input validation and sanitization
- File upload restrictions

## 🔌 Socket.io Events

### Client to Server
- \`join-chat\` - Join a chat room
- \`send-message\` - Send a message
- \`typing\` - User is typing
- \`stop-typing\` - User stopped typing

### Server to Client
- \`new-message\` - New message received
- \`message-notification\` - Message notification
- \`user-typing\` - Other user is typing
- \`user-stop-typing\` - Other user stopped typing
- \`new-exchange-request\` - New exchange request
- \`exchange-accepted\` - Exchange accepted
- \`exchange-rejected\` - Exchange rejected
- \`session-scheduled\` - Session scheduled

## 🧪 Testing

\`\`\`bash
npm test
\`\`\`

## 📦 Deployment

### Using Docker

1. **Build the image**
\`\`\`bash
docker build -t skill-exchange-api .
\`\`\`

2. **Run the container**
\`\`\`bash
docker run -p 5000:5000 --env-file .env skill-exchange-api
\`\`\`

### Manual Deployment

1. Set \`NODE_ENV=production\` in your environment
2. Ensure MongoDB is accessible
3. Configure all environment variables
4. Run \`npm start\`

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NODE_ENV | Environment (development/production) | Yes |
| PORT | Server port | Yes |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | JWT secret key | Yes |
| JWT_EXPIRE | JWT expiration time | Yes |
| CLOUDINARY_* | Cloudinary credentials | Yes |
| EMAIL_* | Email service credentials | Yes |
| CLIENT_URL | Frontend URL for CORS | Yes |

## 📝 Best Practices

- All passwords are hashed before storage
- JWT tokens should be stored securely on client
- Use HTTPS in production
- Implement rate limiting on sensitive endpoints
- Regularly update dependencies
- Monitor error logs
- Backup database regularly

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For support, email support@skillexchange.com or open an issue.

## 🙏 Acknowledgments

- Express.js for the web framework
- MongoDB for the database
- Socket.io for real-time communication
- Cloudinary for image storage
- All contributors and supporters
`;

// =============================================================================
// Dockerfile
// =============================================================================
const dockerfile = `
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]
`;

// =============================================================================
// .dockerignore
// =============================================================================
const dockerignore = `
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
uploads/*
.vscode
coverage
.DS_Store
`;

// =============================================================================
// .gitignore
// =============================================================================
const gitignore = `
node_modules/
.env
uploads/
.DS_Store
coverage/
npm-debug.log
.vscode/
*.log
`;

console.log('✅ Complete Backend API Structure Generated!');
console.log('\\n📦 Files to create:');
console.log('1. server.js');
console.log('2. src/app.js');
console.log('3. All models in src/models/');
console.log('4. All controllers in src/controllers/');
console.log('5. All routes in src/routes/');
console.log('6. All middlewares in src/middlewares/');
console.log('7. All validators in src/validators/');
console.log('8. All utils in src/utils/');
console.log('9. All config files in src/config/');
console.log('10. .env file (copy from .env.example)');
console.log('11. package.json');
console.log('12. README.md');
console.log('13. Dockerfile');
console.log('14. .dockerignore');
console.log('15. .gitignore');
console.log('\\n🚀 To get started:');
console.log('1. npm install');
console.log('2. Configure .env file');
console.log('3. npm run dev');