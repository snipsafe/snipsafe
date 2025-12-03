const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const AppConfig = require('../models/AppConfig');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and management
 */

/**
 * @swagger
 * /api/auth/config:
 *   get:
 *     summary: Get authentication configuration
 *     description: Returns the current authentication mode and settings
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthConfig'
 */
router.get('/config', async (req, res) => {
  try {
    const config = await AppConfig.getConfig();
    res.json({
      authMode: config.authMode,
      allowRegistration: config.allowRegistration,
      azureAd: {
        enabled: config.azureAd.enabled,
        clientId: config.azureAd.clientId,
        tenantId: config.azureAd.tenantId
      }
    });
  } catch (error) {
    console.error('Error fetching auth config:', error);
    // Return default config if there's an error
    res.json({
      authMode: 'local',
      allowRegistration: true,
      azureAd: {
        enabled: false,
        clientId: '',
        tenantId: ''
      }
    });
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account (local authentication only)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - organization
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@company.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: securepassword123
 *               organization:
 *                 type: string
 *                 example: My Company
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', async (req, res) => {
  try {
    const config = await AppConfig.getConfig();
    
    console.log(`📝 Registration attempt - Auth Mode: ${config.authMode}, Allow Registration: ${config.allowRegistration}`);
    
    if (config.authMode === 'azure_ad') {
      console.log('❌ Registration blocked - Azure AD mode enabled');
      return res.status(403).json({ 
        error: 'Registration not available. Please sign in with your Microsoft account.' 
      });
    }
    
    if (config.authMode !== 'local' || !config.allowRegistration) {
      console.log('❌ Registration blocked - Local auth not enabled or registration disabled');
      return res.status(403).json({ error: 'Registration not allowed' });
    }

    const { username, email, password, organization } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({ 
      username, 
      email, 
      password, 
      organization: organization || config.defaultOrganization,
      authProvider: 'local'
    });
    await user.save();

    console.log(`✅ User registered successfully: ${user.email} (${user.organization})`);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        organization: user.organization,
        role: user.role,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@company.com
 *               password:
 *                 type: string
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req, res) => {
  try {
    const config = await AppConfig.getConfig();
    
    console.log(`🔑 Local login attempt - Auth Mode: ${config.authMode}`);
    
    if (config.authMode !== 'local') {
      console.log('❌ Local login blocked - Not in local auth mode');
      return res.status(403).json({ error: 'Local login not allowed. Please use Azure AD authentication.' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true, authProvider: 'local' });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`✅ Local login successful: ${user.email} (${user.organization})`);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        organization: user.organization,
        role: user.role,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('❌ Local login error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/auth/azure/login:
 *   post:
 *     summary: Azure AD login
 *     description: Authenticate user with Azure Active Directory credentials
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 format: email
 *                 example: john@company.com
 *               password:
 *                 type: string
 *                 example: microsoftpassword
 *     responses:
 *       200:
 *         description: Azure AD login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid Azure AD credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/azure/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const config = await AppConfig.getConfig();
    
    console.log(`🔵 Azure AD login attempt - Auth Mode: ${config.authMode}, Enabled: ${config.azureAd.enabled}`);
    console.log(`🔵 Azure AD user: ${username}`);
    
    if (config.authMode !== 'azure_ad' || !config.azureAd.enabled) {
      console.log('❌ Azure AD login blocked - Not enabled');
      return res.status(403).json({ error: 'Azure AD authentication not enabled' });
    }

    // Use Resource Owner Password Credentials (ROPC) flow
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${config.azureAd.tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: config.azureAd.clientId,
        client_secret: config.azureAd.clientSecret,
        grant_type: 'password',
        username: username, // user@domain.com
        password: password,
        scope: 'https://graph.microsoft.com/User.Read'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user info from Microsoft Graph
    const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const azureUser = userResponse.data;

    // Find or create user
    let user = await User.findOne({ email: azureUser.mail || azureUser.userPrincipalName });
    
    if (!user) {
      user = new User({
        username: azureUser.displayName || azureUser.givenName,
        email: azureUser.mail || azureUser.userPrincipalName,
        organization: config.defaultOrganization,
        authProvider: 'azure_ad',
        azureId: azureUser.id,
        password: 'azure_ad_user' // Placeholder
      });
      await user.save();
    } else {
      // Update user info from Azure AD
      user.username = azureUser.displayName || azureUser.givenName;
      user.azureId = azureUser.id;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log(`✅ Azure AD login successful: ${user.email} (${user.organization}) - Provider: ${user.authProvider}`);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        organization: user.organization,
        role: user.role,
        authProvider: user.authProvider
      }
    });

  } catch (error) {
    console.error('❌ Azure AD login error:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      return res.status(401).json({ error: 'Invalid Azure AD credentials' });
    }
    
    res.status(500).json({ error: 'Azure AD authentication failed' });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
