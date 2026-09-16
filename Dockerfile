FROM node:26-slim AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY scripts/install-hooks.js ./scripts/
RUN npm install -g pnpm@12 && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:26-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
COPY scripts/install-hooks.js ./scripts/
RUN npm install -g pnpm@12 && pnpm install --frozen-lockfile --prod
COPY --from=builder /app/dist ./dist
COPY serve.ts ./
EXPOSE 3000
CMD ["node", "serve.ts"]