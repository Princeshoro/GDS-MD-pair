FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only package files for efficient caching
COPY package*.json ./

# Install dependencies
RUN npm install --platform=linuxmusl

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Expose the port that the application runs on (adjust if different)
EXPOSE 8000

# Define the command to run the application
CMD ["npm", "start"]
