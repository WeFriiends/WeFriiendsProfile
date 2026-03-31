# Base image for building the application
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

# The project builds into the "dist" folder
RUN npm run build

# Runtime image
FROM node:20-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]