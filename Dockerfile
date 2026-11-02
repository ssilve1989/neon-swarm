FROM node:26.13.0-slim AS builder
WORKDIR /app
ENV LEFTHOOK=0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts/install-hooks.js ./scripts/
RUN npm install -g pnpm@12 && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:26.13.0-slim AS runner
WORKDIR /app
ENV LEFTHOOK=0
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts/install-hooks.js ./scripts/
RUN npm install -g pnpm@12 && pnpm install --frozen-lockfile --prod
COPY --from=builder /app/dist ./dist
COPY serve.ts ./
EXPOSE 3000
CMD ["node", "serve.ts"]