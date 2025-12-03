# SnipSafe

A private, on-premises code snippet sharing platform similar to GitHub Gist, designed for organizations to securely share code snippets within their teams.

## Features

- **Multiple Authentication Methods**: Local registration/login and Azure Active Directory integration
- **Organization-based Access Control**: Users belong to organizations with controlled access
- **Advanced Snippet Management**: Create, edit, delete, and organize code snippets with syntax highlighting
- **User-Specific Sharing**: Share snippets with specific users by email or username with permissions
- **Real-time Viewer Tracking**: See who's currently viewing each snippet
- **Flexible Sharing System**: Generate unique shareable links with organization-level permissions
- **Granular Visibility Control**: Private, organization-only, or public snippets
- **Multi-language Support**: Syntax highlighting for 18+ programming languages with auto-detection
- **Powerful Search & Discovery**: Full-text search with filters by language, tags, and author
- **Quick Actions & Templates**: Paste from clipboard, code templates, and recent languages
- **Auto-generated Titles**: Smart title generation based on code content and patterns
- **Favorites System**: Save and organize frequently accessed snippets
- **Real-time Statistics**: Track views, popular languages, and trending tags
- **Admin Management**: Complete user and authentication configuration management
- **Interactive API Documentation**: Full Swagger/OpenAPI documentation
- **Developer-friendly Dark Theme**: Optimized for long coding sessions
- **Responsive Design**: Full-width layout utilizing all available screen space

## API Documentation

SnipSafe includes comprehensive API documentation powered by Swagger/OpenAPI 3.0.

### Accessing API Documentation

**Development Environment:**

- URL: `http://localhost:5000/api-docs`
- Available after starting the development server

**Production Environment:**

- URL: `https://yourdomain.com/api-docs`
- Available after deployment

### API Documentation Features

- **Interactive API Explorer**: Test all endpoints directly from the documentation
- **Complete Schema Documentation**: Detailed request/response models for all endpoints
- **Authentication Support**: JWT Bearer token authentication with built-in authorization
- **Request/Response Examples**: Sample data and realistic examples for all operations
- **Comprehensive Error Documentation**: All possible error codes and responses
- **Organized by Categories**:
  - **Authentication**: Login, registration, user management
  - **Snippets**: CRUD operations, sharing, searching, real-time features
  - **Admin**: Configuration management, user administration

### Using the API

1. **Authentication**:
   - Register/login to get a JWT token
   - Use the token in the Authorization header: `Bearer <your-token>`

2. **Testing Endpoints**:
   - Click "Authorize" in Swagger UI
   - Enter your JWT token
   - Try out any endpoint with the interactive forms

3. **Integration**:
   - Copy curl commands or code samples
   - Use the schema definitions for client generation

## Quick Start

### Prerequisites

- Node.js 16+
- Docker (for MongoDB container)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/snipsafe/snipsafe.git
cd SnipSafe
```

2. Start MongoDB with Docker (one command):

```bash
npm run setup-mongo
```

Or manually:

```bash
docker run -d \
  --name snipsafe-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=snipsafe \
  -v snipsafe_data:/data/db \
  mongo:7.0
```

3. Install server dependencies:

```bash
npm install
```

4. Install client dependencies:

```bash
cd client
npm install
cd ..
```

5. Setup environment:

```bash
cp .env.example .env
# Edit .env with your MongoDB configuration
# Use: MONGODB_URI=mongodb://localhost:27017/snipsafe
```

6. Start development servers:

```bash
npm run dev
```

### MongoDB Docker Commands

```bash
# Start MongoDB container
docker start snipsafe-mongodb

# Stop MongoDB container  
docker stop snipsafe-mongodb

# Remove MongoDB container (data will persist in volume)
docker rm snipsafe-mongodb

# Remove MongoDB container and data
docker rm snipsafe-mongodb
docker volume rm snipsafe_data

# View MongoDB logs
docker logs snipsafe-mongodb

# Access MongoDB shell
docker exec -it snipsafe-mongodb mongosh -u admin -p password123
```

The application will be available at:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:5000>
- **API Documentation: <http://localhost:5000/api-docs>**
- MongoDB: localhost:27017

### Production Deployment

#### Docker Production (Recommended)

1. **One-command deployment**:

   ```bash
   docker-compose up -d --build
   ```

2. **Check status**:

   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

3. **Access the application**:
   - Application: <http://localhost:5000>
   - **API Documentation: <http://localhost:5000/api-docs>**
   - MongoDB: localhost:27017

4. **Stop the application**:

   ```bash
   docker-compose down
   ```

#### Configuration

Edit `docker-compose.yml` to change settings:

```yaml
environment:
  JWT_SECRET: your-secure-jwt-secret-here
  AUTH_MODE: azure_ad  # or 'local'
  DEFAULT_ORGANIZATION: Your Company
  # Add Azure AD settings if needed:
  AZURE_AD_CLIENT_ID: your-client-id
  AZURE_AD_CLIENT_SECRET: your-client-secret
  AZURE_AD_TENANT_ID: your-tenant-id
```

#### Manual Production

1. Build the client:

   ```bash
   cd client && npm run build && cd ..
   ```

2. Start the server:

   ```bash
   NODE_ENV=production npm start
   ```

#### Production Environment Variables

**Required Variables**:

- `JWT_SECRET` - Secure JWT signing key (32+ characters)
- `MONGO_ADMIN_PASS` - Secure MongoDB password
- `CLIENT_URL` - Your domain URL (e.g., <https://snipsafe.company.com>)

**Optional Variables**:

- `AUTH_MODE` - Authentication mode (local/azure_ad)
- `DEFAULT_ORGANIZATION` - Default organization name
- Azure AD variables (if using Azure AD auth)

#### Production Services

The Docker Compose production setup includes:

- **SnipSafe Application**: Main app with built frontend
- **MongoDB**: Database with persistent storage
- **Health Checks**: Automatic service monitoring
- **Security**: Non-root user, proper networking

## Authentication Setup

SnipSafe supports two authentication modes that can be configured by administrators:

### Local Authentication (Default)

Users can register and login with username/password stored in the local database.

### Azure Active Directory Integration

For organizations using Microsoft 365/Azure AD, SnipSafe can integrate with Azure AD for seamless authentication.

#### Azure AD Setup Steps

1. **Register Application in Azure Portal**:
   - Go to [Azure Portal](https://portal.azure.com) > Azure Active Directory > App registrations
   - Click "New registration"
   - Name: `SnipSafe`
   - Supported account types: "Accounts in this organizational directory only"
   - **No Redirect URI needed** - leave blank

2. **Enable Resource Owner Password Credentials (ROPC)**:
   - After registration, go to "Authentication"
   - Under "Advanced settings", enable "Allow public client flows"
   - This enables direct username/password authentication

3. **Configure Application**:
   - Note down the **Application (client) ID** and **Directory (tenant) ID**
   - Go to "Certificates & secrets" > "New client secret"
   - Note down the **Client Secret Value**

4. **Set API Permissions**:
   - Go to "API permissions" > "Add a permission" > "Microsoft Graph"
   - Select "Delegated permissions"
   - Add: `User.Read`
   - Click "Grant admin consent"

5. **Configure SnipSafe**:
   - Login as an admin user to SnipSafe
   - Enter the Azure AD configuration:
     - **Client ID**: Application (client) ID from step 3
     - **Client Secret**: Client Secret Value from step 3
     - **Tenant ID**: Directory (tenant) ID from step 3

6. **How the Flow Works** (Direct login, no redirects):

   ```
   User enters Microsoft email/password in SnipSafe
   → SnipSafe validates credentials with Azure AD directly
   → Azure AD returns user information
   → User is logged into SnipSafe
   ```

7. **Test Azure AD Login**:
   - Set authentication mode to "Azure AD"
   - Login page will ask for Microsoft credentials
   - Users enter their full Microsoft email (<user@company.com>) and password

#### Important Security Notes

- **ROPC Flow**: Uses Resource Owner Password Credentials flow
- **Limitations**:
  - ❌ Doesn't work with MFA enabled accounts
  - ❌ Doesn't work with Conditional Access policies
  - ❌ Not recommended by Microsoft for production
- **Alternatives**: If you need MFA support, we'd need to implement redirect-based OAuth2
- **Best for**: Simple on-premises scenarios without MFA requirements

#### Alternative: Simpler Username/Password Flow

If you want to avoid redirects entirely, we could implement a simpler flow where:

- Users enter their Microsoft credentials directly in SnipSafe
- SnipSafe validates against Azure AD directly
- No browser redirects needed

However, this approach:

- ❌ Less secure (SnipSafe handles Microsoft passwords)
- ❌ Not recommended by Microsoft
- ❌ Doesn't work with MFA/Conditional Access
- ❌ Users might not trust entering Microsoft passwords in third-party apps

**Recommended**: Stick with OAuth2 redirect flow for better security and user trust.

#### Azure AD Configuration via API

```bash
# Update to Azure AD mode (no redirect URI needed)
curl -X PUT \
     -H "Authorization: Bearer <admin-token>" \
     -H "Content-Type: application/json" \
     -d '{
       "authMode": "azure_ad",
       "azureAd": {
         "clientId": "your-client-id",
         "clientSecret": "your-client-secret", 
         "tenantId": "your-tenant-id",
         "enabled": true
       }
     }' \
     http://localhost:5000/api/admin/config
```

#### Environment Variables for Azure AD

```bash
# .env file (no redirect URI needed)
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
```

#### Important Notes

- **First User**: The first user to register becomes an admin automatically
- **User Provisioning**: Azure AD users are automatically created on first login
- **Organization Mapping**: All Azure AD users are assigned to the default organization (configurable)
- **Role Management**: Admins can manage user roles through the admin panel
- **Fallback**: If Azure AD is unavailable, admins can switch back to local authentication

### Switching Authentication Modes

Administrators can switch between authentication modes:

1. **Local to Azure AD**: Users with existing accounts can continue using local auth until you disable it
2. **Azure AD to Local**: Existing Azure AD users retain access, new users can register locally
3. **Mixed Mode**: Not supported - choose one authentication method per deployment

## API Endpoints

> **📖 Complete API documentation with interactive testing available at `/api-docs`**

### Public Endpoints (No Authentication Required)

#### Authentication Configuration

- `GET /api/auth/config` - Get current authentication mode and settings

  ```json
  {
    "authMode": "azure_ad",
    "allowRegistration": false,
    "azureAd": {
      "enabled": true,
      "clientId": "xxx",
      "tenantId": "xxx"
    }
  }
  ```

#### Health Check

- `GET /api/health` - Server health status

  ```json
  {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
  ```

- `GET /api-docs` - Interactive API documentation (Swagger UI)

### Authentication Endpoints

#### Local Authentication

- `POST /api/auth/register` - Register new user (local auth mode only)

  ```json
  {
    "username": "john_doe",
    "email": "john@company.com",
    "password": "securepassword",
    "organization": "My Company"
  }
  ```

- `POST /api/auth/login` - Local user login

  ```json
  {
    "email": "john@company.com",
    "password": "securepassword"
  }
  ```

#### Azure AD Authentication

- `POST /api/auth/azure/login` - Direct Azure AD login (ROPC flow)

  ```json
  {
    "username": "john@company.com",
    "password": "microsoftpassword"
  }
  ```

#### User Management

- `GET /api/auth/me` - Get current user profile (requires auth)

  ```json
  {
    "id": "xxx",
    "username": "john_doe",
    "email": "john@company.com",
    "organization": "My Company",
    "role": "user",
    "authProvider": "azure_ad"
  }
  ```

### Snippet Management Endpoints (Requires Authentication)

#### Core CRUD Operations

- `POST /api/snippets` - Create new snippet with auto-title generation

  ```json
  {
    "title": "React Component Example",
    "content": "import React from 'react'...",
    "language": "jsx",
    "description": "A simple React component",
    "visibility": "organization",
    "tags": ["react", "component", "example"]
  }
  ```

- `GET /api/snippets/:id` - Get snippet by ID with sharing permissions
- `PUT /api/snippets/:id` - Update existing snippet
- `DELETE /api/snippets/:id` - Soft delete snippet

#### Snippet Discovery & Organization

- `GET /api/snippets/my` - Get current user's snippets (paginated)
- `GET /api/snippets/org` - Get organization snippets (paginated)  
- `GET /api/snippets/shared-with-me` - Get snippets shared with current user
- `GET /api/snippets/search` - Advanced search with multiple filters
- `GET /api/snippets/stats` - Get organization statistics (languages, tags)

#### Public Sharing

- `GET /api/snippets/share/:shareId` - Get shared snippet (respects visibility)

#### User-Specific Sharing

- `POST /api/snippets/:id/share` - Share snippet with specific users by email/username
- `GET /api/snippets/:id/sharing` - Get sharing details and user list  
- `DELETE /api/snippets/:id/share/:shareEntryId` - Remove user from sharing list

#### Real-time Features

- `POST /api/snippets/:id/join-view` - Join snippet viewing (track current viewer)
- `POST /api/snippets/:id/leave-view` - Leave snippet viewing
- `GET /api/snippets/:id/viewers` - Get current viewers for a snippet

### Admin Endpoints (Requires Admin Role)

#### Application Configuration

- `GET /api/admin/config` - Get complete application configuration

  ```json
  {
    "authMode": "azure_ad",
    "allowRegistration": false,
    "defaultOrganization": "My Company",
    "azureAd": {
      "enabled": true,
      "clientId": "xxx",
      "tenantId": "xxx"
    }
  }
  ```

- `PUT /api/admin/config` - Update application configuration

  ```json
  {
    "authMode": "local",
    "allowRegistration": true,
    "defaultOrganization": "Updated Company",
    "azureAd": {
      "clientId": "new-client-id",
      "clientSecret": "new-secret",
      "tenantId": "new-tenant-id",
      "enabled": false
    }
  }
  ```

#### User Management  

- `GET /api/admin/users` - Get all users in the system

  ```json
  [
    {
      "id": "xxx",
      "username": "john_doe",
      "email": "john@company.com",
      "organization": "My Company",
      "role": "user",
      "authProvider": "azure_ad",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
  ```

- `PUT /api/admin/users/:id/role` - Update user role

  ```json
  {
    "role": "admin"
  }
  ```

## Supported Programming Languages

SnipSafe provides syntax highlighting and auto-detection for:

**Web Technologies**: JavaScript, TypeScript, HTML, CSS, JSX, TSX
**Backend Languages**: Python, Java, C#, PHP, Ruby, Go, Rust
**Systems Programming**: C, C++
**Mobile Development**: Swift, Kotlin  
**Database**: SQL
**Scripting**: Bash/Shell, PowerShell
**Data Formats**: JSON, XML, YAML
**Documentation**: Markdown
**Plain Text**: For unsupported languages or configuration files

## Advanced Features

### Auto-Generated Titles

SnipSafe intelligently generates snippet titles based on code content:

- **Function Detection**: `function handleSubmit` → "handleSubmit function"
- **Class Detection**: `class UserService` → "UserService class"
- **Framework Recognition**: React components, Flask APIs, Django models
- **Pattern Matching**: Database queries, CSS animations, shell scripts
- **Smart Fallbacks**: Meaningful keywords and content analysis

### Real-time Collaboration Features

- **Live Viewer Tracking**: See who's currently viewing each snippet
- **User-Specific Sharing**: Granular permissions (view/edit) for individual users
- **Smart Notifications**: Real-time updates when snippets are shared
- **Organizational Insights**: Popular languages, trending tags, active users

### Intelligent Search & Discovery

- **Full-Text Search**: Searches across title, description, and code content
- **Multi-Filter Support**: Language, tags, author, and date filters
- **Smart Suggestions**: Popular languages, trending tags, recent activity
- **Saved Searches**: Quick access to frequently used search patterns

## Quick Actions & Productivity Features

### Paste & Save

- Automatically detects programming language from clipboard content
- Generates intelligent titles based on code analysis
- Supports keyboard shortcuts (Ctrl+V/Cmd+V)

### Code Templates

- Pre-built templates for common patterns:
  - React Components
  - API Endpoints
  - Database Queries
  - CSS Flexbox layouts
- One-click template loading

### Favorites System

- Save frequently accessed snippets
- Local storage-based favorites
- Quick access via dedicated favorites tab

### Smart Metadata

- Automatic language detection
- Line count and character count tracking
- Creation and modification timestamps
- View count tracking

## Security & Access Control

### Authentication Security

- JWT tokens with 7-day expiration
- Bcrypt password hashing (local auth)
- OAuth2 integration with Microsoft Graph API
- Rate limiting (100 requests per 15 minutes per IP)

### Data Protection

- Organization-based data isolation
- Helmet.js security headers
- Input validation and sanitization
- CORS configuration
- Trust proxy settings for rate limiting

### Admin Controls

- Role-based access control (user/admin)
- Authentication mode switching
- User management capabilities
- Configuration management via API

## Technology Stack

### Backend

- Node.js & Express
- MongoDB with Mongoose (Docker container)
- JWT Authentication
- bcrypt for password hashing
- OAuth2 integration with Azure Active Directory
- Microsoft Graph API integration

### Frontend

- React 18
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- React Syntax Highlighter

## License

MIT License

## API Integration Examples

### JavaScript/Node.js

```javascript
// Get user's snippets
const response = await fetch('/api/snippets/my', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### Python

```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.get('/api/snippets/search?q=react', headers=headers)
snippets = response.json()
```

### cURL

```bash
# Create a new snippet
curl -X POST http://localhost:5000/api/snippets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello World",
    "content": "console.log(\"Hello, World!\");",
    "language": "javascript",
    "visibility": "organization"
  }'
```

> **💡 Tip**: Visit `/api-docs` for interactive examples and code generation in multiple languages!

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/snipsafe/snipsafe/blob/main/CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository on [GitHub](https://github.com/snipsafe/snipsafe)
2. Clone your fork locally
3. Follow the installation steps above
4. Create a feature branch
5. Make your changes
6. Submit a pull request

### Reporting Issues

Please report bugs and feature requests on our [GitHub Issues](https://github.com/snipsafe/snipsafe/issues) page.

## Community

- **GitHub**: [https://github.com/snipsafe/snipsafe](https://github.com/snipsafe/snipsafe)
- **Issues**: [https://github.com/snipsafe/snipsafe/issues](https://github.com/snipsafe/snipsafe/issues)
- **Discussions**: [https://github.com/snipsafe/snipsafe/discussions](https://github.com/snipsafe/snipsafe/discussions)
