#### DEV STAGE ####
FROM node:20.11.1 as dev

WORKDIR /chat

# Copy every json files into image
COPY *.json ./

# Install packages
RUN npm ci

ENV PATH=./node_modules/.bin:$PATH

# Copy project code into image
COPY src/ src/

EXPOSE 4001

# Run in dev env
CMD ["npm", "run", "dev"]

#### BUILD STAGE ####
# Check if use alpine version
FROM node:20.11.1 as build

# Set working directory
WORKDIR /chat

# Copy package files into image
COPY package*.json ./

# Install packages
RUN npm ci

# Copy project code into image
COPY . .

# Build our server
RUN npm run build

#### RUN STAGE ####
FROM build as prod

# By default NODE_ENV is development
# NODE_ENV = "development" | "production"
ENV NODE_ENV="production"

# Set working directory
WORKDIR /chat

# Copy package files into image
COPY package*.json ./

# Install packages
RUN npm ci

EXPOSE 4001
CMD ["npm", "run", "prod"]
