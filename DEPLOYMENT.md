# SkillExchange Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying the SkillExchange application with:
- **Backend**: Deployed on Render
- **Frontend**: Deployed on Vercel
- **Database**: MongoDB Atlas (cloud)

## 📋 Prerequisites

Before deployment, ensure you have:
- [ ] GitHub repository with your code
- [ ] MongoDB Atlas account
- [ ] Cloudinary account (for image storage)
- [ ] Email service account (Gmail/SendGrid)
- [ ] Render account
- [ ] Vercel account

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account

2. **Create Cluster**
   - Create a new cluster (M0 Sandbox is free)
   - Choose your preferred region
   - Set cluster name (e.g., "skillexchange")

3. **Database Access**
   - Go to "Database Access"
   - Create a new database user
   - Set username and password
   - Grant "Read and write to any database" permissions

4. **Network Access**
   - Go to "Network Access"
   - Add IP Address: `0.0.0.0/0` (allows all IPs)
   - Or add specific IPs for better security

5. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Repository
1. Ensure your code is pushed to GitHub
2. Verify `Backend/package.json` has correct scripts:
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

### Step 2: Deploy on Render
1. **Sign up/Login to Render**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your SkillExchange repository

3. **Configure Service**
   ```
   Name: skillexchange-backend
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Root Directory: Backend
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillexchange
   JWT_SECRET=your-super-secret-jwt-key-for-production
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@skillexchange.com
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   CLIENT_URL=https://your-frontend-domain.vercel.app
   OTP_EXPIRE_MINUTES=10
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://skillexchange-backend.onrender.com`)

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
1. Update `Frontend/vite.config.js` for production:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "src")
       }
     },
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             ui: ['@headlessui/react', '@radix-ui/react-dialog'],
             state: ['@tanstack/react-query', 'axios'],
             utils: ['framer-motion', 'date-fns', 'clsx'],
             realtime: ['socket.io-client']
           }
         }
       },
       chunkSizeWarningLimit: 1000,
       sourcemap: false // Disable sourcemaps in production
     }
   });
   ```

### Step 2: Deploy on Vercel
1. **Sign up/Login to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select your SkillExchange repository

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: Frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL (e.g., `https://skillexchange.vercel.app`)

## 🔄 Update Backend with Frontend URL

After frontend deployment:
1. Go to Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Update `CLIENT_URL` to your Vercel frontend URL
5. Redeploy the backend

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://your-backend-url.onrender.com/health
```

### Frontend Test
1. Visit your Vercel frontend URL
2. Try registering a new account
3. Test login functionality
4. Verify real-time chat works

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify MongoDB connection string format

3. **CORS Issues**
   - Update `CLIENT_URL` in backend environment
   - Check frontend API URL configuration

4. **Database Connection**
   - Verify MongoDB Atlas cluster is running
   - Check network access settings
   - Validate connection string

### Debug Commands

**Check Backend Logs:**
```bash
# In Render dashboard, go to "Logs" tab
```

**Check Frontend Build:**
```bash
# In Vercel dashboard, check "Functions" tab
```

## 📊 Monitoring

### Render Monitoring
- View logs in Render dashboard
- Monitor resource usage
- Set up alerts for downtime

### Vercel Monitoring
- Check deployment status
- Monitor build performance
- View analytics in Vercel dashboard

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets
   - Rotate secrets regularly

2. **Database Security**
   - Use MongoDB Atlas security features
   - Limit network access when possible
   - Enable database encryption

3. **API Security**
   - Implement rate limiting
   - Use HTTPS everywhere
   - Validate all inputs

## 🚀 Production Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] MongoDB Atlas cluster configured
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Email service working
- [ ] File upload (Cloudinary) working
- [ ] Real-time chat functioning
- [ ] SSL certificates active
- [ ] Domain names configured (optional)
- [ ] Monitoring set up
- [ ] Backup strategy in place

## 📞 Support

If you encounter issues:
1. Check the logs in Render/Vercel dashboards
2. Verify environment variables
3. Test API endpoints individually
4. Check MongoDB Atlas cluster status
5. Review this deployment guide

---

**Happy Deploying! 🎉**
