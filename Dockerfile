# Use the specific Node.js v20.11.0 image
FROM node:20.11.0

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that the Node.js server will run on
EXPOSE 3000

# Command to run the Node.js app with npm run dev
CMD ["npm", "run", "dev"]