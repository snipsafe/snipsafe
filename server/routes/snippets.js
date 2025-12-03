const express = require('express');
const Snippet = require('../models/Snippet');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Snippets
 *     description: Code snippet management
 */

/**
 * @swagger
 * /api/snippets:
 *   post:
 *     summary: Create a new snippet
 *     description: Create a new code snippet
 *     tags: [Snippets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - language
 *             properties:
 *               title:
 *                 type: string
 *                 example: React Component Example
 *               content:
 *                 type: string
 *                 example: "import React from 'react';\n\nconst MyComponent = () => {\n  return <div>Hello World</div>;\n};"
 *               language:
 *                 type: string
 *                 example: jsx
 *               description:
 *                 type: string
 *                 example: A simple React component
 *               visibility:
 *                 type: string
 *                 enum: [private, organization, public]
 *                 example: organization
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [react, component, javascript]
 *     responses:
 *       201:
 *         description: Snippet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Snippet'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, language, description, visibility, tags } = req.body;
    
    const snippet = new Snippet({
      title,
      content,
      language,
      description,
      visibility,
      tags,
      author: req.user.userId,
      organization: req.user.organization
    });

    await snippet.save();
    await snippet.populate('author', 'username');
    
    res.status(201).json(snippet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/snippets/my:
 *   get:
 *     summary: Get user's snippets
 *     description: Retrieve all snippets created by the authenticated user
 *     tags: [Snippets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of snippets per page
 *     responses:
 *       200:
 *         description: User's snippets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 snippets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Snippet'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 */
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const snippets = await Snippet.find({ 
      author: req.user.userId,
      isActive: true 
    })
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Snippet.countDocuments({ 
      author: req.user.userId,
      isActive: true 
    });

    res.json({
      snippets,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/snippets/{id}:
 *   get:
 *     summary: Get snippet by ID
 *     description: Retrieve a specific snippet by its ID
 *     tags: [Snippets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Snippet ID
 *     responses:
 *       200:
 *         description: Snippet details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Snippet'
 *       404:
 *         description: Snippet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/snippets/{id}/share:
 *   post:
 *     summary: Share snippet with specific users
 *     description: Share a snippet with specific users by email or username
 *     tags: [Snippets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Snippet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 example: ["user1@company.com", "user2@company.com"]
 *               usernames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["john_doe", "jane_smith"]
 *               permissions:
 *                 type: string
 *                 enum: [view, edit]
 *                 default: view
 *     responses:
 *       200:
 *         description: Snippet shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sharedWith:
 *                   type: array
 *                   items:
 *                     type: object
 *                 notFound:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalSharedUsers:
 *                   type: integer
 */

/**
 * @swagger
 * /api/snippets/{id}/viewers:
 *   get:
 *     summary: Get current viewers
 *     description: Get list of users currently viewing the snippet
 *     tags: [Snippets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Snippet ID
 *     responses:
 *       200:
 *         description: Current viewers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentViewers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                       lastSeen:
 *                         type: string
 *                         format: date-time
 *                       isOnline:
 *                         type: boolean
 */

/**
 * @swagger
 * /api/snippets/search:
 *   get:
 *     summary: Search snippets
 *     description: Search for snippets with various filters
 *     tags: [Snippets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (searches title, description, content)
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by programming language
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author username
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 snippets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Snippet'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 total:
 *                   type: integer
 */

// Create snippet
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, language, description, visibility, tags } = req.body;
    
    const snippet = new Snippet({
      title,
      content,
      language,
      description,
      visibility,
      tags,
      author: req.user.userId,
      organization: req.user.organization
    });

    await snippet.save();
    await snippet.populate('author', 'username');
    
    res.status(201).json(snippet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's snippets (must come before /:id route)
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const snippets = await Snippet.find({ 
      author: req.user.userId,
      isActive: true 
    })
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Snippet.countDocuments({ 
      author: req.user.userId,
      isActive: true 
    });

    res.json({
      snippets,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get organization snippets (must come before /:id route)
router.get('/org', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const snippets = await Snippet.find({
      organization: req.user.organization,
      visibility: { $in: ['organization', 'public'] },
      isActive: true
    })
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({ snippets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search snippets (must come before /:id route)
router.get('/search', auth, async (req, res) => {
  try {
    const { q, language, tags, author, page = 1, limit = 20 } = req.query;
    
    let query = {
      organization: req.user.organization,
      isActive: true
    };

    // Build search conditions
    const searchConditions = [];

    // Text search across title, description, and content
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      searchConditions.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { content: searchRegex }
        ]
      });
    }

    // Filter by language
    if (language && language !== 'all') {
      searchConditions.push({ language: language });
    }

    // Filter by tags
    if (tags && tags.trim()) {
      const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagList.length > 0) {
        searchConditions.push({ tags: { $in: tagList } });
      }
    }

    // Filter by author
    if (author && author.trim()) {
      const User = require('../models/User');
      const authorUser = await User.findOne({ 
        username: new RegExp(author.trim(), 'i'),
        organization: req.user.organization 
      });
      if (authorUser) {
        searchConditions.push({ author: authorUser._id });
      } else {
        // No user found, return empty results
        return res.json({ snippets: [], total: 0 });
      }
    }

    // Apply search conditions
    if (searchConditions.length > 0) {
      query.$and = searchConditions;
    }

    // Visibility permissions
    query.$or = [
      { visibility: 'public' },
      { visibility: 'organization' },
      { visibility: 'private', author: req.user.userId }
    ];

    const snippets = await Snippet.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Snippet.countDocuments(query);

    res.json({
      snippets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get popular languages and tags (must come before /:id route)
router.get('/stats', auth, async (req, res) => {
  try {
    const matchQuery = { 
      organization: req.user.organization, 
      isActive: true,
      $or: [
        { visibility: 'public' },
        { visibility: 'organization' },
        { visibility: 'private', author: req.user.userId }
      ]
    };

    const [languages, tags] = await Promise.all([
      Snippet.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ]),
      Snippet.aggregate([
        { $match: matchQuery },
        { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 25 }
      ])
    ]);

    res.json({ languages, tags });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get snippet by share ID (must come before /:id route)
router.get('/share/:shareId', optionalAuth, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({ 
      shareId: req.params.shareId,
      isActive: true 
    }).populate('author', 'username');

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    // Updated access permissions for share links
    if (snippet.visibility === 'private') {
      // Private snippets are accessible to anyone in the same organization via share link
      if (!req.user || snippet.organization !== req.user.organization) {
        return res.status(403).json({ error: 'Access denied. This snippet is only accessible to members of the same organization.' });
      }
    } else if (snippet.visibility === 'organization') {
      if (!req.user || snippet.organization !== req.user.organization) {
        return res.status(403).json({ error: 'Access denied. This snippet is only accessible to members of the same organization.' });
      }
    }
    // Public snippets are accessible to anyone

    // Increment view count
    snippet.views += 1;
    await snippet.save();

    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Share snippet with specific users
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { emails, usernames, permissions = 'view' } = req.body;
    
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      author: req.user.userId,
      isActive: true
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found or access denied' });
    }

    const User = require('../models/User');
    const sharedUsers = [];
    const notFoundUsers = [];

    // Process emails
    if (emails && emails.length > 0) {
      for (const email of emails) {
        const user = await User.findOne({ email: email.trim(), isActive: true });
        
        // Check if already shared with this user
        const alreadyShared = snippet.sharedWith.some(
          share => (share.user && share.user.toString() === user?._id.toString()) || 
                   share.email === email.trim()
        );

        if (!alreadyShared) {
          snippet.sharedWith.push({
            user: user?._id,
            email: email.trim(),
            permissions,
            sharedBy: req.user.userId
          });
          sharedUsers.push({ email: email.trim(), found: !!user });
        }
        
        if (!user) {
          notFoundUsers.push({ type: 'email', value: email.trim() });
        }
      }
    }

    // Process usernames
    if (usernames && usernames.length > 0) {
      for (const username of usernames) {
        const user = await User.findOne({ 
          username: username.trim(), 
          organization: req.user.organization,
          isActive: true 
        });
        
        if (user) {
          // Check if already shared
          const alreadyShared = snippet.sharedWith.some(
            share => share.user && share.user.toString() === user._id.toString()
          );

          if (!alreadyShared) {
            snippet.sharedWith.push({
              user: user._id,
              email: user.email,
              permissions,
              sharedBy: req.user.userId
            });
            sharedUsers.push({ username: username.trim(), email: user.email, found: true });
          }
        } else {
          notFoundUsers.push({ type: 'username', value: username.trim() });
        }
      }
    }

    await snippet.save();

    res.json({
      message: 'Snippet shared successfully',
      sharedWith: sharedUsers,
      notFound: notFoundUsers,
      totalSharedUsers: snippet.sharedWith.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/snippets/{id}/sharing:
 *   get:
 *     summary: Get snippet sharing details
 *     description: Get details of users with whom the snippet is shared
 *     tags: [Snippets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Snippet ID
 *     responses:
 *       200:
 *         description: Snippet sharing details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 author:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                 visibility:
 *                   type: string
 *                 shareId:
 *                   type: string
 *                 sharedWith:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           username:
 *                             type: string
 *                       email:
 *                         type: string
 *                       permissions:
 *                         type: string
 *                       sharedAt:
 *                         type: string
 *                         format: date-time
 *                       sharedBy:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           username:
 *                             type: string
 */

/**
 * @swagger
 * /api/snippets/{id}/share/{shareEntryId}:
 *   delete:
 *     summary: Remove user from snippet sharing
 *     description: Remove a user from the sharing list of a snippet
 *     tags: [Snippets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Snippet ID
 *       - in: path
 *         name: shareEntryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Share entry ID
 *     responses:
 *       200:
 *         description: User removed from sharing list
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
 * /api/snippets/shared-with-me:
 *   get:
 *     summary: Get snippets shared with current user
 *     description: Retrieve all snippets that are shared with the authenticated user
 *     tags: [Snippets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of snippets per page
 *     responses:
 *       200:
 *         description: Snippets shared with the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 snippets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Snippet'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 */

// Remove user from snippet sharing
router.delete('/:id/share/:shareEntryId', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      author: req.user.userId,
      isActive: true
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found or access denied' });
    }

    snippet.sharedWith = snippet.sharedWith.filter(
      share => share._id.toString() !== req.params.shareEntryId
    );

    await snippet.save();

    res.json({ message: 'User removed from sharing list' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get snippets shared with current user
router.get('/shared-with-me', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const snippets = await Snippet.find({
      'sharedWith.user': req.user.userId,
      isActive: true
    })
    .populate('author', 'username')
    .populate('sharedWith.sharedBy', 'username')
    .sort({ 'sharedWith.sharedAt': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Add sharing info to each snippet
    const snippetsWithSharingInfo = snippets.map(snippet => {
      const sharingInfo = snippet.sharedWith.find(
        share => share.user && share.user.toString() === req.user.userId
      );
      
      return {
        ...snippet.toObject(),
        sharingInfo: {
          permissions: sharingInfo?.permissions,
          sharedAt: sharingInfo?.sharedAt,
          sharedBy: sharingInfo?.sharedBy
        }
      };
    });

    res.json({
      snippets: snippetsWithSharingInfo,
      totalPages: Math.ceil(snippets.length / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join snippet viewing (track current viewer)
router.post('/:id/join-view', auth, async (req, res) => {
  try {
    const { socketId } = req.body;
    
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    // Check access permissions (same as regular snippet access)
    const isAuthor = snippet.author.toString() === req.user.userId;
    const isSharedUser = snippet.sharedWith.some(
      share => share.user && share.user.toString() === req.user.userId
    );
    const hasOrgAccess = snippet.visibility === 'organization' && 
                        snippet.organization === req.user.organization;
    const isPublic = snippet.visibility === 'public';

    if (!isAuthor && !isSharedUser && !hasOrgAccess && !isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove existing viewer entry for this user
    snippet.currentViewers = snippet.currentViewers.filter(
      viewer => viewer.user.toString() !== req.user.userId
    );

    // Add current viewer
    snippet.currentViewers.push({
      user: req.user.userId,
      lastSeen: new Date(),
      socketId
    });

    // Clean up old viewers
    await snippet.cleanupViewers();

    // Populate viewer info
    await snippet.populate('currentViewers.user', 'username email');

    res.json({
      message: 'Joined snippet viewing',
      currentViewers: snippet.currentViewers.map(viewer => ({
        user: viewer.user,
        lastSeen: viewer.lastSeen,
        isOnline: true
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave snippet viewing (remove current viewer)
router.post('/:id/leave-view', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    // Remove viewer
    snippet.currentViewers = snippet.currentViewers.filter(
      viewer => viewer.user.toString() !== req.user.userId
    );

    await snippet.save();
    res.json({ message: 'Left snippet viewing' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current viewers for a snippet
router.get('/:id/viewers', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      isActive: true
    }).populate('currentViewers.user', 'username email');

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    // Clean up old viewers first
    await snippet.cleanupViewers();
    await snippet.populate('currentViewers.user', 'username email');

    res.json({
      currentViewers: snippet.currentViewers.map(viewer => ({
        user: viewer.user,
        lastSeen: viewer.lastSeen,
        isOnline: true
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update the existing Get snippet by ID route to include viewers
router.get('/:id', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      isActive: true
    })
    .populate('author', 'username')
    .populate('currentViewers.user', 'username email');

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    // Check access permissions (updated to include shared users)
    const isAuthor = snippet.author._id.toString() === req.user.userId;
    const isSharedUser = snippet.sharedWith.some(
      share => share.user && share.user._id.toString() === req.user.userId
    );
    const hasOrgAccess = snippet.visibility === 'organization' && 
                        snippet.organization === req.user.organization;
    const isPublic = snippet.visibility === 'public';

    if (!isAuthor && !isSharedUser && !hasOrgAccess && !isPublic) {
      if (snippet.visibility === 'private') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Clean up old viewers
    await snippet.cleanupViewers();
    
    // Add sharing info if user is in shared list
    let sharingInfo = null;
    if (isSharedUser) {
      const shareEntry = snippet.sharedWith.find(
        share => share.user && share.user.toString() === req.user.userId
      );
      sharingInfo = {
        permissions: shareEntry?.permissions,
        sharedAt: shareEntry?.sharedAt
      };
    }

    res.json({
      ...snippet.toObject(),
      sharingInfo,
      currentViewers: snippet.currentViewers.map(viewer => ({
        user: viewer.user,
        lastSeen: viewer.lastSeen,
        isOnline: true
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update snippet
router.put('/:id', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      author: req.user.userId,
      isActive: true
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    Object.assign(snippet, req.body);
    await snippet.save();
    await snippet.populate('author', 'username');

    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/snippets/{id}:
 *   delete:
 *     summary: Delete snippet
 *     description: Soft delete a snippet (mark as inactive)
 *     tags: [Snippets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Snippet ID
 *     responses:
 *       200:
 *         description: Snippet deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.delete('/:id', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      author: req.user.userId
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    snippet.isActive = false;
    await snippet.save();

    res.json({ message: 'Snippet deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
