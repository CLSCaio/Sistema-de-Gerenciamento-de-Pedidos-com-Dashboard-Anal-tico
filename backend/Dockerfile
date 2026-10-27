FROM node:20-alpine
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --include=dev
COPY backend/ ./
COPY seed /seed
RUN npx prisma generate && npm run build
ENV NODE_ENV=production
ENV SEED_PATH=/seed/data.json
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && node dist/server.js"]
