FROM node:18-alpine

WORKDIR /app

# Copy shared dependencies
COPY shared/package*.json ./shared/
COPY shared/prisma ./shared/prisma/
COPY shared/utils ./shared/utils/

# Copy service files
COPY services/user-service/package*.json ./services/user-service/

# Install dependencies
RUN cd shared && npm install
RUN cd services/user-service && npm install

# Generate Prisma client
RUN cd shared && npx prisma generate

# Copy service source
COPY services/user-service ./services/user-service/

WORKDIR /app/services/user-service

EXPOSE 5002

CMD ["node", "server.js"]

