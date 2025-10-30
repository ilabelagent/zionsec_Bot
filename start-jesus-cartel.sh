#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║         STARTING JESUS CARTEL - Music Publishing        ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd /teamspace/studios/this_studio/jesus-cartel-production

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting Jesus Cartel on port 3000..."
echo "📍 Location: /teamspace/studios/this_studio/jesus-cartel-production"
echo "🌐 Access: http://localhost:3000"
echo ""

npm start
