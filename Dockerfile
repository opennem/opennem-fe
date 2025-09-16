FROM node:14-alpine

# Install build dependencies for node-sass
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Yarn is already included in node:14-alpine, just verify version
RUN yarn --version

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["yarn", "dev"]