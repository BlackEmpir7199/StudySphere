FROM node:18-alpine

WORKDIR /app

# Copy shared dependencies
COPY shared/package*.json ./shared/
COPY shared/prisma ./shared/prisma/
COPY shared/utils ./shared/utils/

# Copy service files
COPY services/auth-service/package*.json ./services/auth-service/

# Install dependencies
RUN cd shared && npm install
RUN cd services/auth-service && npm install

# Generate Prisma client
RUN cd shared && npx prisma generate

# Copy service source
COPY services/auth-service ./services/auth-service/

WORKDIR /app/services/auth-service

EXPOSE 5001

CMD ["node", "server.js"]

