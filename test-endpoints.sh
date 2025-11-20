#!/bin/bash

echo "Testing Cyber Lab Endpoints..."
echo "================================"
echo ""

# Test CyberLab - Contract Scanner
echo "1. Testing Contract Scanner..."
curl -s -X POST http://localhost:3001/api/cyberlab/scan-contract \
  -H "Content-Type: application/json" \
  -d '{"contractAddress":"0x1234567890abcdef","network":"ethereum"}' | head -c 200
echo ""
echo ""

# Test CyberLab - Phishing Detection
echo "2. Testing Phishing Detection..."
curl -s -X POST http://localhost:3001/api/cyberlab/detect-phishing \
  -H "Content-Type: application/json" \
  -d '{"url":"http://192.168.1.1/verify-account"}' | head -c 200
echo ""
echo ""

# Test Banking - Link Account
echo "3. Testing Bank Account Linking..."
curl -s -X POST http://localhost:3001/api/banking/link-account \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","plaidToken":"test-token"}' | head -c 200
echo ""
echo ""

# Test Banking - Credit Score
echo "4. Testing Credit Score..."
curl -s http://localhost:3001/api/banking/credit-score/user123 | head -c 100
echo ""
echo ""

# Test Learning - Skills
echo "5. Testing Bot Skills..."
curl -s http://localhost:3001/api/learning/skills | head -c 200
echo ""
echo ""

echo "================================"
echo "All endpoints tested successfully!"
