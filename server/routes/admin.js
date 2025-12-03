const express = require('express');
const AppConfig = require('../models/AppConfig');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Administrative operations (requires admin role)
 */

/**
 * @swagger
 * /api/admin/config:
 *   get:
 *     summary: Get application configuration
 *     description: Retrieve the complete application configuration (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authMode:
 *                   type: string
 *                   enum: [local, azure_ad]
 *                 allowRegistration:
 *                   type: boolean
 *                 defaultOrganization:
 *                   type: string
 *                 azureAd:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     clientId:
 *                       type: string
 *                     tenantId:
 *                       type: string
 *       403:
 *         description: Access denied - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update application configuration
 *     description: Update the application configuration (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               authMode:
 *                 type: string
 *                 enum: [local, azure_ad]
 *               allowRegistration:
 *                 type: boolean
 *               defaultOrganization:
 *                 type: string
 *               azureAd:
 *                 type: object
 *                 properties:
 *                   clientId:
 *                     type: string
 *                   clientSecret:
 *                     type: string
 *                   tenantId:
 *                     type: string
 *                   enabled:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users in the system (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role
 *     description: Update a user's role (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

// Middleware to check admin role
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get app configuration
router.get('/config', auth, requireAdmin, async (req, res) => {
  try {
    const config = await AppConfig.getConfig();
    // Don't send sensitive data
    const safeConfig = {
      authMode: config.authMode,
      allowRegistration: config.allowRegistration,
      defaultOrganization: config.defaultOrganization,
      azureAd: {
        enabled: config.azureAd.enabled,
        clientId: config.azureAd.clientId,
        tenantId: config.azureAd.tenantId
      }
    };
    res.json(safeConfig);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update app configuration
router.put('/config', auth, requireAdmin, async (req, res) => {
  try {
    const config = await AppConfig.getConfig();
    
    const {
      authMode,
      allowRegistration,
      defaultOrganization,
      azureAd
    } = req.body;

    if (authMode) config.authMode = authMode;
    if (typeof allowRegistration === 'boolean') config.allowRegistration = allowRegistration;
    if (defaultOrganization) config.defaultOrganization = defaultOrganization;
    
    if (azureAd) {
      if (azureAd.clientId) config.azureAd.clientId = azureAd.clientId;
      if (azureAd.clientSecret) config.azureAd.clientSecret = azureAd.clientSecret;
      if (azureAd.tenantId) config.azureAd.tenantId = azureAd.tenantId;
      if (typeof azureAd.enabled === 'boolean') config.azureAd.enabled = azureAd.enabled;
    }

    await config.save();
    res.json({ message: 'Configuration updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
