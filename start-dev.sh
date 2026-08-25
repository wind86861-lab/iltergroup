#!/bin/bash
# Start both backend and frontend development servers

echo "🚀 Starting IlterGroup Development Servers..."

# Kill any existing processes on ports 3001 and 5173
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start backend server
echo "📦 Starting backend server on port 3001..."
cd "$(dirname "$0")/server"
npm run dev > /tmp/ilter-server.log 2>&1 &
SERVER_PID=$!
echo "   Backend PID: $SERVER_PID"

# Wait for backend to start
sleep 3

# Start frontend dev server
echo "🎨 Starting frontend dev server on port 5173..."
cd "$(dirname "$0")/app"
npm run dev > /tmp/ilter-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 3

echo ""
echo "✅ Development servers started!"
echo ""
echo "   📱 Frontend:  http://localhost:5173"
echo "   🔧 Backend:   http://localhost:3001"
echo "   👤 Admin:     http://localhost:5173/admin"
echo ""
echo "   📋 Server logs:   tail -f /tmp/ilter-server.log"
echo "   📋 Frontend logs: tail -f /tmp/ilter-frontend.log"
echo ""
echo "   🛑 To stop: kill $SERVER_PID $FRONTEND_PID"
echo ""
