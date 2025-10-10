FROM node:18-alpine

WORKDIR /app

# Copy shared dependencies
COPY shared/package*.json ./shared/
COPY shared/prisma ./shared/prisma/
COPY shared/utils ./shared/utils/

# Copy service files
COPY services/chat-service/package*.json ./services/chat-service/

# Install dependencies
RUN cd shared && npm install
RUN cd services/chat-service && npm install

# Generate Prisma client
RUN cd shared && npx prisma generate

# Copy service source
COPY services/chat-service ./services/chat-service/

WORKDIR /app/services/chat-service

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5004

CMD ["node", "server.js"]

