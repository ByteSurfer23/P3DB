# Stage 1: The `builder` stage for building the Next.js app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (cached)
COPY package.json package-lock.json ./

# Install all dependencies (including dev deps)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: The `runner` stage for running the production server
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV production
EXPOSE 3000

# Copy only the necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Start the Next.js production server
CMD ["npm", "start"]
