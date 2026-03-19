#!/bin/bash

# DewClaw Project Dashboard Starter
# Simple lightweight dashboard on port 3000

echo "🎯 Starting DewClaw Project Dashboard..."
echo ""

# Check if port 3000 is already in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use!"
    echo "Current process on port 3000:"
    lsof -Pi :3000 -sTCP:LISTEN
    echo ""
    echo "Kill existing process? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "🔪 Killing process on port 3000..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        echo "❌ Exiting. Please free port 3000 manually."
        exit 1
    fi
fi

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "📝 GitHub token not found in environment."
    echo "The dashboard will use mock data for demonstration."
    echo "To enable real GitHub integration:"
    echo "  export GITHUB_TOKEN='your_github_personal_access_token'"
    echo ""
fi

# Start the dashboard
echo "🚀 Launching dashboard server..."
echo "📍 URL: http://localhost:3000"
echo ""

cd "$(dirname "$0")/dashboard"
exec node server.js