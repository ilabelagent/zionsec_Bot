import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import attackController from './controllers/attack-controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Security middleware with relaxed CSP for lab
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests from local network
        if (!origin || origin.includes('localhost') || origin.includes('192.168.') || origin.includes('10.0.')) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for demo
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`🔗 WebSocket client connected from ${clientIp}`);
    
    clients.add(ws);
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to ZionSec Cyber Lab',
        timestamp: new Date()
    }));
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(ws, data);
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });
    
    ws.on('close', () => {
        clients.delete(ws);
        console.log(`🔌 WebSocket client disconnected`);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Broadcast to all connected clients
function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
        }
    });
}

// Handle WebSocket messages
function handleWebSocketMessage(ws, data) {
    switch (data.type) {
        case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
            break;
            
        case 'subscribe':
            // Client wants to subscribe to specific events
            ws.subscriptions = data.events || [];
            break;
            
        case 'command':
            // Handle C&C commands from web interface
            executeCommand(data.command, data.params);
            break;
            
        default:
            console.log('Unknown WebSocket message type:', data.type);
    }
}

// Execute attack commands
async function executeCommand(command, params) {
    try {
        let result;
        
        switch (command) {
            case 'scan_network':
                result = await scanNetwork(params);
                break;
            case 'start_attack':
                result = await startAttack(params);
                break;
            case 'stop_attack':
                result = await stopAttack(params);
                break;
            default:
                result = { error: 'Unknown command' };
        }
        
        broadcast({
            type: 'command_result',
            command,
            result,
            timestamp: new Date()
        });
        
    } catch (error) {
        broadcast({
            type: 'error',
            message: error.message,
            timestamp: new Date()
        });
    }
}

// Mount attack controller routes
app.use('/api', attackController);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        version: '2.0.0',
        platform: process.platform,
        uptime: process.uptime(),
        websocket: {
            clients: clients.size
        },
        features: [
            'network_scanning',
            'mitm_attacks',
            'ddos_simulation',
            'ai_botnet',
            'payload_generation',
            'vulnerability_scanning'
        ]
    });
});

// Statistics endpoint
app.get('/api/stats', (req, res) => {
    res.json({
        connectedClients: clients.size,
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
    });
});

// Simulated attack functions
async function scanNetwork(params) {
    broadcast({
        type: 'scan_progress',
        message: 'Starting network scan...',
        progress: 0
    });
    
    // Simulate scanning progress
    for (let i = 0; i <= 100; i += 10) {
        setTimeout(() => {
            broadcast({
                type: 'scan_progress',
                progress: i,
                message: `Scanning... ${i}%`
            });
        }, i * 100);
    }
    
    return { success: true, hosts: [] };
}

async function startAttack(params) {
    const { type, target } = params;
    
    broadcast({
        type: 'attack_started',
        attackType: type,
        target,
        timestamp: new Date()
    });
    
    return { success: true, attackId: Date.now().toString() };
}

async function stopAttack(params) {
    const { attackId } = params;
    
    broadcast({
        type: 'attack_stopped',
        attackId,
        timestamp: new Date()
    });
    
    return { success: true };
}

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all interfaces for LAN access

server.listen(PORT, HOST, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║       🧠 ZionSec Advanced Cybersecurity Lab v2.0            ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   🌐 Server Status: ONLINE                                  ║
║   📡 Port: ${PORT}                                             ║
║   🔗 Local: http://localhost:${PORT}                           ║
║   🔗 LAN:   http://${getLocalIP()}:${PORT}                     ║
║                                                              ║
║   ⚡ WebSocket: ENABLED                                      ║
║   🛡️  Security: LAB MODE (Educational Use Only)             ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   Available Features:                                        ║
║   • Network Scanning & Discovery                            ║
║   • MITM Attacks (ARP Spoofing, SSL Strip)                 ║
║   • DDoS/DoS Attack Simulation                              ║
║   • AI-Powered Botnet Controller                            ║
║   • Payload Generation & Encoding                           ║
║   • Vulnerability Scanning                                  ║
║   • SQL Injection & XSS Testing                            ║
║   • Phishing Campaign Builder                               ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   ⚠️  WARNING: For Educational Purposes Only!               ║
║   Use only on networks you own or have permission to test   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
});

// Get local IP address
function getLocalIP() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    
    // Close WebSocket connections
    clients.forEach(client => {
        client.send(JSON.stringify({
            type: 'server_shutdown',
            message: 'Server is shutting down'
        }));
        client.close();
    });
    
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received. Shutting down...');
    process.exit(0);
});

export default app;