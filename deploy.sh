#!/bin/bash

# SkillExchange Deployment Script
# This script helps you deploy your SkillExchange application

echo "🚀 SkillExchange Deployment Helper"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Check if changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for deployment'"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📋 Deployment Checklist:"
echo "1. ✅ Git repository initialized"
echo "2. 📝 Environment variables configured"
echo "3. 🗄️  MongoDB Atlas cluster created"
echo "4. ☁️  Cloudinary account set up"
echo "5. 📧 Email service configured"
echo ""

# Check for environment files
if [ ! -f "Backend/env.example" ]; then
    echo "❌ Backend environment template not found"
    exit 1
fi

if [ ! -f "Frontend/env.example" ]; then
    echo "❌ Frontend environment template not found"
    exit 1
fi

echo "📁 Environment templates found:"
echo "   - Backend/env.example"
echo "   - Frontend/env.example"
echo ""

echo "🔧 Next Steps:"
echo "=============="
echo ""
echo "1. 🗄️  Set up MongoDB Atlas:"
echo "   - Create cluster at https://mongodb.com/atlas"
echo "   - Get connection string"
echo "   - Update Backend/env.example with your MongoDB URI"
echo ""
echo "2. ☁️  Set up Cloudinary:"
echo "   - Create account at https://cloudinary.com"
echo "   - Get API credentials"
echo "   - Update Backend/env.example with Cloudinary details"
echo ""
echo "3. 📧 Configure Email Service:"
echo "   - Set up Gmail App Password or SendGrid"
echo "   - Update Backend/env.example with email credentials"
echo ""
echo "4. 🚀 Deploy Backend on Render:"
echo "   - Go to https://render.com"
echo "   - Connect GitHub repository"
echo "   - Create Web Service"
echo "   - Set Root Directory: Backend"
echo "   - Add environment variables from Backend/env.example"
echo ""
echo "5. 🎨 Deploy Frontend on Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import GitHub repository"
echo "   - Set Root Directory: Frontend"
echo "   - Add environment variables from Frontend/env.example"
echo "   - Update VITE_API_URL with your Render backend URL"
echo ""
echo "6. 🔄 Update Backend CORS:"
echo "   - Update CLIENT_URL in Render with your Vercel frontend URL"
echo "   - Redeploy backend"
echo ""

echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎉 Happy Deploying!"
