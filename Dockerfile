# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# copy the .env file
COPY .env ./

# Install any needed packages
RUN npm install

# Bundle app source inside Docker image
COPY . .

# Build your app
RUN npm run build

# Your app binds to port 3000 by default
EXPOSE 3000

# Define environment variable (if needed)
# ENV NAME=value

# Run the application
CMD ["npm", "run", "start:prod"]
