#!/bin/bash

# StudySphere Setup Script
# This script sets up the development environment

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         StudySphere Development Setup                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm $NPM_VERSION found"

# Check Docker
echo ""
echo "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "Please install Docker from https://docker.com/"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
echo "✅ $DOCKER_VERSION found"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  docker-compose not found, checking for 'docker compose'..."
    if ! docker compose version &> /dev/null; then
        echo "❌ Docker Compose is not installed"
        exit 1
    fi
    echo "✅ Docker Compose (plugin) found"
else
    echo "✅ docker-compose found"
fi

# Create .env file if it doesn't exist
echo ""
echo "Setting up environment variables..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file from env.example"
    echo "⚠️  Please edit .env with your Azure credentials"
else
    echo "ℹ️  .env file already exists"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
echo "This may take a few minutes..."

npm install
echo "✅ Root dependencies installed"

cd shared
npm install
echo "✅ Shared dependencies installed"

cd ../services/auth-service
npm install
echo "✅ Auth service dependencies installed"

cd ../user-service
npm install
echo "✅ User service dependencies installed"

cd ../group-service
npm install
echo "✅ Group service dependencies installed"

cd ../chat-service
npm install
echo "✅ Chat service dependencies installed"

cd ../../frontend
npm install
echo "✅ Frontend dependencies installed"

cd ..

# Generate Prisma client
echo ""
echo "Generating Prisma client..."
cd shared
npx prisma generate
echo "✅ Prisma client generated"

cd ..

# Start Docker containers
echo ""
echo "Starting PostgreSQL and Redis containers..."
docker-compose up -d postgres redis
echo "✅ Database containers started"

# Wait for PostgreSQL to be ready
echo ""
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Run Prisma migrations
echo ""
echo "Running database migrations..."
cd shared
npx prisma migrate dev --name init
echo "✅ Database migrations completed"

cd ..

# Create uploads directory
echo ""
echo "Creating uploads directory..."
mkdir -p services/chat-service/uploads
echo "✅ Uploads directory created"

# Summary
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         Setup Complete! 🎉                                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env with your Azure credentials:"
echo "   - AZURE_OPENAI_KEY"
echo "   - AZURE_OPENAI_ENDPOINT"
echo "   - AZURE_MODERATOR_KEY"
echo "   - AZURE_MODERATOR_ENDPOINT"
echo ""
echo "2. Start all services:"
echo "   npm run dev:auth      # Terminal 1 - Port 5001"
echo "   npm run dev:user      # Terminal 2 - Port 5002"
echo "   npm run dev:group     # Terminal 3 - Port 5003"
echo "   npm run dev:chat      # Terminal 4 - Port 5004"
echo "   npm run dev:frontend  # Terminal 5 - Port 5173"
echo ""
echo "3. Or use Docker Compose:"
echo "   docker-compose up"
echo ""
echo "4. Access the application:"
echo "   http://localhost:5173"
echo ""
echo "For infrastructure deployment:"
echo "   cd infra && ./apply.sh"
echo ""
echo "For demo:"
echo "   node docs/demo.js"
echo ""

