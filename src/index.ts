import 'dotenv/config';
import { buildApp } from "./app.js";
import { connectMongo } from "./db/index.ts";
import { registerRoutes } from "./routes/route.js";

async function startServer() {
  const fastify = await buildApp();

  await connectMongo();
  fastify.log.info("MongoDB connected");

  await registerRoutes(fastify);

  const port = Number(process.env.PORT) || 3002;

  await fastify.listen({
    port,
    host: "0.0.0.0",
  });

  fastify.log.info(`Server running at:`);
  fastify.log.info(`Local: http://localhost:${port}`);
}

process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing DB...");
  await import("./db/index.ts").then((mod) => mod.closeMongo());
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing DB...");
  await import("./db/index.ts").then((mod) => mod.closeMongo());
  process.exit(0);
});

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
