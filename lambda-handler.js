// AWS Lambda handler for ZionSec Bot
// This wraps the Express app for serverless deployment

import serverless from 'serverless-http';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

// Import your existing server configuration
const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import your routes
import attackController from './controllers/attack-controller.js';
import scanController from './controllers/scan-controller.js';
import payloadController from './controllers/payload-controller.js';

// API Routes
app.use('/api/attack', attackController);
app.use('/api/scan', scanController);
app.use('/api/payload', payloadController);

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        environment: process.env.NODE_ENV,
        runtime: 'bun',
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// Export handler for AWS Lambda
export const handler = serverless(app);