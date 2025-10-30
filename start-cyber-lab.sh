#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║          STARTING CYBER LAB - Security Analysis         ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd /teamspace/studios/this_studio/cyber-lab-production

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting Cyber Lab on port 3001..."
echo "📍 Location: /teamspace/studios/this_studio/cyber-lab-production"
echo "🌐 Access: http://localhost:3001"
echo ""

npm start
