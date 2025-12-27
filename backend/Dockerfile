# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package manager files
COPY package.json pnpm-lock.yaml ./

# Copy prisma directory before install (for postinstall)
COPY prisma ./prisma

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build TypeScript
RUN pnpm run build

# Expose port (change if your app uses a different port)
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
