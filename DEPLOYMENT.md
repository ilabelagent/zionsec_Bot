# ZionSec Advanced Cyber Lab - Deployment Guide

## 🚀 Overview
ZionSec Cyber Lab is a comprehensive penetration testing and attack simulation platform designed for educational purposes and security testing on authorized networks.

## ⚡ Features

### Attack Capabilities
- **Network Scanning**: ARP, SYN, UDP, and comprehensive network discovery
- **MITM Attacks**: ARP spoofing, SSL stripping, DNS spoofing
- **DoS/DDoS**: SYN flood, UDP flood, HTTP flood, Slowloris, DNS amplification
- **AI Botnet**: Adaptive learning, swarm intelligence, persistent APT strategies
- **Injection Attacks**: SQL injection, XSS, CSRF testing
- **Payload Generation**: Reverse shells, bind shells, Meterpreter, ransomware simulation
- **Phishing**: Email campaigns with multiple templates
- **Vulnerability Scanning**: Automated security assessment

## 📋 Prerequisites

### System Requirements
- Node.js 16+ 
- npm 8+
- Administrator/root privileges (for network operations)
- 2GB+ RAM
- Network interface card with promiscuous mode support

### Network Requirements
- Local network access
- Permission to test on target network
- Firewall exceptions for ports 5000 (HTTP) and WebSocket

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone https://github.com/ilabelagent/zionsec_Bot.git
cd zionsec_Bot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Platform-Specific Setup

#### Windows
```bash
# Run as Administrator
npm start

# Allow through Windows Firewall when prompted
```

#### Linux
```bash
# Install additional tools for network operations
sudo apt-get update
sudo apt-get install -y net-tools arp-scan nmap

# Run with sudo for network access
sudo npm start
```

#### macOS
```bash
# Install network tools
brew install arp-scan nmap

# Run with sudo
sudo npm start
```

## 🌐 Deployment Options

### Local Testing (localhost only)
```bash
npm run start:local
# Access at: http://localhost:5000
```

### LAN Network Testing
```bash
npm run start:lan
# Access at: http://YOUR_IP:5000
# Find your IP in the console output
```

### Production Deployment (Web Interface Only)
For Vercel/cloud deployment (limited features, no real attacks):
```bash
git push origin main
# Vercel auto-deploys web interface
```

## 🔧 Configuration

### Network Settings
Edit `server-lan.js`:
```javascript
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Change to specific IP if needed
```

### Attack Intensity
Configure in web interface or modify `controllers/attack-controller.js`:
```javascript
const ATTACK_LIMITS = {
    maxPacketsPerSecond: 10000,
    maxBotnetSize: 1000,
    scanTimeout: 2000
};
```

## 🚦 Usage Guide

### 1. Start the Server
```bash
npm start
```

### 2. Access Web Interface
Open browser and navigate to:
- Local: `http://localhost:5000`
- LAN: `http://YOUR_IP:5000`

### 3. Network Discovery
1. Click "Network Scanner" tab
2. Enter network range (e.g., 192.168.1.0/24)
3. Select scan type
4. Click "Start Scan"

### 4. Launch Attacks
1. Select target from discovered hosts
2. Choose attack type
3. Configure parameters
4. Click launch button
5. Monitor in terminal output

### 5. AI Botnet Deployment
1. Go to "AI Botnet" tab
2. Set botnet size (1-1000 nodes)
3. Choose AI strategy
4. Deploy and monitor C&C server

### 6. Generate Payloads
1. Open "Payload Generator" tab
2. Select payload type and target OS
3. Enter callback IP and port
4. Generate and optionally encode

## 🛡️ Security Considerations

### ⚠️ Legal Warning
- **ONLY** use on networks you own or have explicit permission to test
- Unauthorized network attacks are illegal
- This tool is for educational and authorized testing only
- Users are responsible for compliance with local laws

### Safety Features
- Local network restriction by default
- Attack intensity limits
- Educational warnings on all dangerous operations
- Simulation mode for learning without real attacks

## 📊 Monitoring & Logs

### Real-time Monitoring
- WebSocket connection provides live updates
- Terminal shows all attack activity
- Metrics dashboard displays current status

### Log Files
Logs are stored in `/logs` directory:
- `attack.log` - Attack history
- `scan.log` - Network scan results
- `botnet.log` - Botnet activity

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Linux/Mac

# Kill the process or change port in server-lan.js
```

#### Permission Denied
```bash
# Run with elevated privileges
sudo npm start  # Linux/Mac
# Run as Administrator on Windows
```

#### WebSocket Connection Failed
- Check firewall settings
- Ensure port 5000 is open
- Verify network connectivity

#### Network Scan Not Working
- Ensure running with admin/root privileges
- Check network interface is active
- Verify target network is reachable

## 🔄 Updates

### Get Latest Version
```bash
git pull origin main
npm install
```

### Update Dependencies
```bash
npm update
npm audit fix
```

## 📚 API Documentation

### Endpoints

#### Network Scanning
```http
POST /api/scan/network
Content-Type: application/json

{
  "range": "192.168.1.0/24",
  "type": "comprehensive"
}
```

#### Start Attack
```http
POST /api/attack/mitm
Content-Type: application/json

{
  "target": "192.168.1.100",
  "gateway": "192.168.1.1"
}
```

#### Deploy Botnet
```http
POST /api/botnet/deploy
Content-Type: application/json

{
  "size": 100,
  "strategy": "adaptive"
}
```

#### Generate Payload
```http
POST /api/payload/generate
Content-Type: application/json

{
  "type": "reverse_shell",
  "os": "linux",
  "callback": {
    "ip": "192.168.1.50",
    "port": 4444
  }
}
```

## 🤝 Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License
MIT License - For educational purposes only

## 💬 Support
- GitHub Issues: [Report bugs](https://github.com/ilabelagent/zionsec_Bot/issues)
- Documentation: Check `/docs` folder
- Community: Join our Discord server

## 🔴 Disclaimer
This tool is provided for educational and authorized security testing purposes only. The developers are not responsible for any misuse or damage caused by this tool. Always ensure you have proper authorization before testing any network or system.

---

**Remember**: With great power comes great responsibility. Use ethically! 🛡️