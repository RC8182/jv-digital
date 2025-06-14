# -------- 1. builder --------
FROM node:20.5.1-bullseye-slim AS builder
WORKDIR /app

# Copiamos los manifests y la .env (¡asegúrate de que no esté ignorada!)
COPY package.json package-lock.json ./
COPY .env ./

RUN npm ci         
COPY prisma prisma
RUN npx prisma generate

COPY . .            
RUN npm run build   
RUN npm prune --production

# -------- 2. runner --------
FROM node:20.5.1-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next       ./.next
COPY --from=builder /app/public       ./public
COPY --from=builder /app/prisma       ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
