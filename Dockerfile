# Step 1: Use Node.js 18 as our base image (Alpine = lightweight Linux)
FROM node:18-alpine

# Step 2: Set the working directory inside the container
# All following commands will run from /app
WORKDIR /app

# Step 3: Copy package files first (for better caching)
# Docker caches layers - if package.json hasn't changed, it won't reinstall
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of your application code
COPY . .

# Step 6: Tell Docker your app uses port 3000
EXPOSE 3000

# Step 7: Command to run when container starts
CMD ["node", "app.js"]
