const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const snippetRoutes = require('./routes/snippets');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware - Updated for serving static files
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Serve static files in production with proper headers
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  
  // Serve static files with proper MIME types
  app.use(express.static(buildPath, {
    maxAge: '1d', // Cache static files for 1 day
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));
  
  console.log(`📁 Serving static files from: ${buildPath}`);
}

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SnipSafe API Documentation'
}));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the server health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/admin', adminRoutes);

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Don't serve index.html for static assets
    if (req.path.startsWith('/static/') || req.path.endsWith('.css') || req.path.endsWith('.js') || req.path.endsWith('.map')) {
      return res.status(404).send('Not found');
    }
    
    const indexPath = path.join(__dirname, '../client/build/index.html');
    console.log(`🌐 Serving React app: ${req.path} -> ${indexPath}`);
    res.sendFile(indexPath);
  });
}

// Database connection with better error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/snipsafe', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  // Log current authentication mode
  try {
    const AppConfig = require('./models/AppConfig');
    const config = await AppConfig.getConfig();
    console.log(`🔐 Authentication Mode: ${config.authMode.toUpperCase()}`);
    
    if (config.authMode === 'azure_ad') {
      if (!config.azureAd.enabled) {
        console.error('❌ Azure AD mode selected but Azure AD is not properly configured!');
        process.exit(1);
      }
      console.log(`🔵 Azure AD Tenant: ${config.azureAd.tenantId}`);
      console.log(`📧 Default Organization: ${config.defaultOrganization}`);
      console.log(`🚫 Registration: Disabled (Azure AD mode)`);
    } else if (config.authMode === 'local') {
      console.log(`👤 Local Registration: ${config.allowRegistration ? 'Enabled' : 'Disabled'}`);
    }
    
    console.log('✅ Authentication configuration validated successfully');
  } catch (error) {
    console.error('❌ Authentication configuration error:', error.message);
    console.error('🛑 Server startup aborted due to configuration issues');
    process.exit(1);
  }
}).catch((error) => {
  console.error('MongoDB connection error:', error);
  console.log('Make sure MongoDB is running. You can start it with:');
  console.log('npm run setup-mongo');
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`SnipSafe server running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Application available at: http://localhost:${PORT}`);
    console.log(`📖 API Documentation available at: http://localhost:${PORT}/api-docs`);
  } else {
    console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  }
});
