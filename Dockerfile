# -------- 1. Fase deps: instala SOLO dependencias de producción --------
FROM node:20.5.1-bullseye-slim AS deps
WORKDIR /app

# Copiamos solo los manifests para aprovechar la caché
COPY package.json package-lock.json ./

# Instalamos dependencias sin las dev‑deps y limpiamos la caché
RUN npm ci --omit=dev \
    && npm cache clean --force

# -------- 2. Fase builder: genera Prisma Client y compila la app --------
FROM node:20.5.1-bullseye-slim AS builder
WORKDIR /app

# Traemos los node_modules ya filtrados
COPY --from=deps /app/node_modules ./node_modules

# Generamos Prisma Client (asegúrate de tener prisma/schema.prisma)
COPY prisma ./prisma
RUN npx prisma generate

# Copiamos el resto del código fuente
COPY . .

# Construimos la app (ajusta el script según tu proyecto)
RUN npm run build

# -------- 3. Fase runner: imagen ligera para producción --------
FROM node:20.5.1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiamos solo lo necesario desde builder
COPY --from=builder /app ./

EXPOSE 3000

# Mantiene npm por si el proyecto usa "npm start". Cambia si prefieres distroless.
CMD ["npm", "start"]
