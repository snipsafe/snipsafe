const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SnipSafe API',
    version: '1.0.0',
    description: 'A private, on-premises code snippet sharing platform API',
    contact: {
      name: 'SnipSafe Support',
      email: 'support@snipsafe.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    },
    {
      url: 'https://snipsafe.yourdomain.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          username: { type: 'string', example: 'john_doe' },
          email: { type: 'string', format: 'email', example: 'john@company.com' },
          organization: { type: 'string', example: 'My Company' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          authProvider: { type: 'string', enum: ['local', 'azure_ad'], example: 'local' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Snippet: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          title: { type: 'string', example: 'React Component Example' },
          content: { type: 'string', example: 'import React from \'react\';\n\nconst MyComponent = () => {\n  return <div>Hello World</div>;\n};\n\nexport default MyComponent;' },
          language: { type: 'string', example: 'jsx' },
          description: { type: 'string', example: 'A simple React component' },
          tags: { type: 'array', items: { type: 'string' }, example: ['react', 'component', 'javascript'] },
          visibility: { type: 'string', enum: ['private', 'organization', 'public'], example: 'organization' },
          author: { $ref: '#/components/schemas/User' },
          organization: { type: 'string', example: 'My Company' },
          shareId: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          views: { type: 'integer', example: 42 },
          isActive: { type: 'boolean', example: true },
          sharedWith: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                user: { type: 'string', example: '507f1f77bcf86cd799439011' },
                email: { type: 'string', example: 'user@company.com' },
                permissions: { type: 'string', enum: ['view', 'edit'], example: 'view' },
                sharedAt: { type: 'string', format: 'date-time' },
                sharedBy: { type: 'string', example: '507f1f77bcf86cd799439011' }
              }
            }
          },
          currentViewers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                lastSeen: { type: 'string', format: 'date-time' },
                isOnline: { type: 'boolean', example: true }
              }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Error message' }
        }
      },
      AuthConfig: {
        type: 'object',
        properties: {
          authMode: { type: 'string', enum: ['local', 'azure_ad'], example: 'local' },
          allowRegistration: { type: 'boolean', example: true },
          azureAd: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean', example: false },
              clientId: { type: 'string', example: 'your-client-id' },
              tenantId: { type: 'string', example: 'your-tenant-id' }
            }
          }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: ['./server/routes/*.js', './server/index.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
