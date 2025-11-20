#!/bin/bash

echo "Testing Real-Time Attack Logging System..."
echo "==========================================="
echo ""

# Test 1: Simulate DDoS attack
echo "1. Simulating DDoS Attack..."
curl -s -X POST http://localhost:3001/api/cyberlab/simulate-attack \
  -H "Content-Type: application/json" \
  -d '{"attackType":"DDoS","target":"production-server.example.com"}' | jq '.method'
echo ""

# Test 2: Detect phishing URL
echo "2. Detecting Phishing URL..."
curl -s -X POST http://localhost:3001/api/cyberlab/detect-phishing \
  -H "Content-Type: application/json" \
  -d '{"url":"http://192.168.1.1/verify-account-now"}' | jq '.'
echo ""

# Test 3: Scan contract for vulnerabilities
echo "3. Scanning Smart Contract..."
curl -s -X POST http://localhost:3001/api/cyberlab/scan-contract \
  -H "Content-Type: application/json" \
  -d '{"contractAddress":"0x1234567890abcdef","network":"ethereum"}' | jq '.riskScore'
echo ""

# Test 4: Get attack logs
echo "4. Retrieving Attack Logs..."
curl -s http://localhost:3001/api/attacks/logs?limit=10 | jq 'length'
echo " attack logs found"
echo ""

# Test 5: Get vulnerability reports
echo "5. Retrieving Vulnerability Reports..."
curl -s http://localhost:3001/api/attacks/vulnerabilities?limit=10 | jq 'length'
echo " vulnerability reports found"
echo ""

# Test 6: Get threat intelligence
echo "6. Retrieving Threat Intelligence..."
curl -s http://localhost:3001/api/attacks/threats?limit=10 | jq 'length'
echo " threat intelligence entries found"
echo ""

# Test 7: Get statistics
echo "7. Getting Attack Statistics..."
curl -s http://localhost:3001/api/attacks/statistics | jq '.'
echo ""

echo "==========================================="
echo "Attack Logging System Test Complete!"
