FROM node:20-alpine

WORKDIR /app

# Copy package files for initial build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

EXPOSE 3000

# The source code will be mounted at runtime
CMD ["sh", "-c", "cd frontend && npm run dev"] 