#!/bin/bash
# Stop both backend and frontend development servers

echo "🛑 Stopping IlterGroup Development Servers..."

# Kill processes on ports 3001 and 5173
lsof -ti:3001 | xargs kill -9 2>/dev/null && echo "   ✅ Backend stopped (port 3001)" || echo "   ℹ️  Backend not running"
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "   ✅ Frontend stopped (port 5173)" || echo "   ℹ️  Frontend not running"

echo ""
echo "✅ All servers stopped!"
