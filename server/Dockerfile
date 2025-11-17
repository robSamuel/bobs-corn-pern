#build dependencies
FROM node:20-bullseye AS builder

WORKDIR /app

ARG DATABASE_URL="postgres://postgres:postgres@db:5432/mydb"
ENV DATABASE_URL=$DATABASE_URL

RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl libssl1.1 && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

#Build image
FROM node:20-bullseye

WORKDIR /app

ARG DATABASE_URL="postgres://postgres:postgres@db:5432/mydb"
ENV DATABASE_URL=$DATABASE_URL
ENV NODE_ENV=production

RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl libssl1.1 && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/index.js"]
