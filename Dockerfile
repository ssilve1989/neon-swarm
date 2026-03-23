FROM oven/bun:1.3.10 AS builder
WORKDIR /app
COPY package.json bun.lock ./
COPY scripts/install-hooks.js ./scripts/
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1.3.10-slim AS runner
WORKDIR /app
COPY package.json bun.lock ./
COPY scripts/install-hooks.js ./scripts/
RUN bun install --frozen-lockfile --production
COPY --from=builder /app/dist ./dist
COPY serve.ts ./
EXPOSE 3000
CMD ["bun", "run", "serve.ts"]
