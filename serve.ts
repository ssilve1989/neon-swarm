import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => c.text("ok"));
app.use("*", serveStatic({ root: "./dist" }));
app.use("*", serveStatic({ path: "./dist/index.html" }));

serve({ port: Number(process.env.PORT ?? 3000), fetch: app.fetch });
