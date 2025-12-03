# Multi-stage build for production
FROM node:18-alpine AS client-build

WORKDIR /app/client

# Copy package files and install ALL dependencies (including dev dependencies for build)
COPY client/package*.json ./
RUN npm install --legacy-peer-deps

# Copy all client source files
COPY client/ ./

# Build the React application with Tailwind CSS compilation
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install server dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy server code
COPY server/ ./server/

# Copy built client files (includes CSS, JS, and HTML)
COPY --from=client-build /app/client/build ./client/build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S snipsafe -u 1001

# Change ownership of the app directory
RUN chown -R snipsafe:nodejs /app
USER snipsafe

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "server/index.js"]
