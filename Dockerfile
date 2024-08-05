FROM node:22.2.0-bookworm

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install app dependencies. When in prod, omit the "--include-dev".
# There are saner ways to separate dev from prod, but let's not dive into that, as they add more complexity
RUN npm install --no-cache --include-dev

# Copy app source code
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]
