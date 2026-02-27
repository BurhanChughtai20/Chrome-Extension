import Fastify from "fastify";
import fastifyHelmet from "@fastify/helmet";
import fastifyCompress from "@fastify/compress";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import fastifyResponseValidation from "@fastify/response-validation";
import fastifyRateLimit from "@fastify/rate-limit";
import { getUserUsage } from "./utils/usage.ts";

export async function buildApp() {
  const fastify = Fastify({ logger: true });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET missing");

  await fastify.register(fastifyHelmet);

  await fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      const allowed = [
        "http://127.0.0.1:3001",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://restaurant-management-syste-git-9f0028-chughtaiburhans-projects.vercel.app",
      ];

      const ngrokRegex = /^https:\/\/.*\.ngrok-free\.(app|dev)$/;

      if (allowed.includes(origin) || ngrokRegex.test(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-device-id"],
  });

  await fastify.register(fastifyCompress);

  await fastify.register(fastifyCookie);

  await fastify.register(fastifyJwt, {
    secret: jwtSecret,
    sign: {
      algorithm: "HS256",
    },
  });

  await fastify.register(fastifyRateLimit, {
    global: false,
    max: async (req) => {
      const deviceId = req.headers["x-device-id"] as string;
      if (!deviceId) return 0;

      const usage = await getUserUsage(deviceId);

      const tokensPerRequest = 500;

      const remainingRequests = Math.floor(
        (usage.freeTokensLimit - usage.dailyTokensUsed) / tokensPerRequest,
      );

      return remainingRequests > 0 ? remainingRequests : 0;
    },
    timeWindow: 24 * 60 * 60 * 1000,
    keyGenerator: (req) => {
      const deviceId = req.headers["x-device-id"] as string;
      return deviceId || "unknown-device";
    },
    errorResponseBuilder: (req, context) => {
      return {
        statusCode: 429,
        error: "Too Many Requests",
        message:
          "You have exceeded your daily free token limit. Please upgrade to continue.",
      };
    },
  });

  await fastify.register(fastifyResponseValidation);

  return fastify;
}
