# Stage 1: The `builder` stage for building the Next.js app
# We use a recent version of Node.js for the build process.
FROM node:18-alpine AS builder

# Set the working directory for the build process.
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock)
# This step is cached, so it's fast if dependencies don't change.
COPY package.json package-lock.json ./

# Install all dependencies including dev dependencies for the build.
RUN npm install

# Copy the rest of the application source code into the container.
COPY . .

# Build the Next.js application for production.
RUN npm run build

# Stage 2: The `runner` stage for running the production server
# We use a lightweight node image for the final production container.
FROM node:18-alpine AS runner

# Set the working directory for the final application.
WORKDIR /app

# Set environment variables for production.
ENV NODE_ENV production
# Set the port that the application will listen on.
# Render will automatically set a PORT environment variable.
EXPOSE 3000

# Copy necessary files from the `builder` stage to the final image.
# We only need the compiled code, dependencies, and static assets.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Start the Next.js production server.
# The server will automatically use the PORT environment variable set by Render.
CMD [ "npm", "start" ]
