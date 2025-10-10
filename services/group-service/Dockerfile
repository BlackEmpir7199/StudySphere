FROM node:18-alpine

WORKDIR /app

# Copy shared dependencies
COPY shared/package*.json ./shared/
COPY shared/prisma ./shared/prisma/
COPY shared/utils ./shared/utils/

# Copy service files
COPY services/group-service/package*.json ./services/group-service/

# Install dependencies
RUN cd shared && npm install
RUN cd services/group-service && npm install

# Generate Prisma client
RUN cd shared && npx prisma generate

# Copy service source
COPY services/group-service ./services/group-service/

WORKDIR /app/services/group-service

EXPOSE 5003

CMD ["node", "server.js"]

