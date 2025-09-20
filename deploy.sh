#!/bin/bash

# EventPass Deployment Script for Vercel
echo "🚀 Starting EventPass Deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Deploy Backend
echo "📦 Deploying Backend..."
cd backend
vercel --prod

# Deploy Frontend
echo "📦 Deploying Frontend..."
cd ../frontend-vite
vercel --prod

echo "✅ Deployment completed!"
echo "📝 Next steps:"
echo "1. Set up Vercel Postgres database"
echo "2. Set up Upstash Redis"
echo "3. Configure environment variables"
echo "4. Update domain configurations"
