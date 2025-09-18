#!/bin/bash

set -e

echo "🚀 Starting EventPass API deployment..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

# Build and deploy
echo "📦 Building Docker images..."
docker-compose -f docker-compose.yml build --no-cache

echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.yml run --rm app npx prisma migrate deploy

echo "🔄 Starting services..."
docker-compose -f docker-compose.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 30

# Health check
echo "🏥 Performing health checks..."
if curl -f http://localhost/health; then
    echo "✅ Deployment successful!"
    echo "🌐 API is running at http://localhost"
else
    echo "❌ Deployment failed - health check failed"
    docker-compose -f docker-compose.yml logs app
    exit 1
fi

echo "📊 Service status:"
docker-compose -f docker-compose.yml ps
