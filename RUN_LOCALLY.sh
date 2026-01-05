#!/bin/bash

# Quick Local Setup Script

echo "🚀 Setting up local development environment..."

# Step 1: Backend Setup
echo "📦 Setting up backend..."
cd /Users/samayshetty/CWMVP

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_PATH=chatbot.db
VECTOR_DB_PATH=./vector_db
KNOWLEDGE_BASE_PATH=./DATABSE
AUTH0_DOMAIN=your_domain.auth0.com
AUTH0_AUDIENCE=your_auth0_audience
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_NEXTJS_URL=http://localhost:3000
EOF
    echo "⚠️  Please edit .env file with your actual credentials!"
fi

# Initialize database
echo "🗄️  Initializing database..."
python initialize_db.py

# Step 2: Frontend Setup
echo "📦 Setting up frontend..."
cd auth0-nextjs

# Install dependencies
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    AUTH0_SECRET=$(openssl rand -hex 32)
    cat > .env.local << EOF
AUTH0_SECRET=$AUTH0_SECRET
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your_domain.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_AUDIENCE=your_auth0_audience
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
EOF
    echo "⚠️  Please edit .env.local file with your actual Auth0 credentials!"
fi

echo "✅ Setup complete!"
echo ""
echo "To run the app:"
echo "  Terminal 1 (Backend):  cd /Users/samayshetty/CWMVP && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
echo "  Terminal 2 (Frontend): cd /Users/samayshetty/CWMVP/auth0-nextjs && npm run dev"
echo ""
echo "Then open: http://localhost:3000"

