import Fastify, { FastifyError } from "fastify";
import fastifyHelmet from "@fastify/helmet";
import fastifyCompress from "@fastify/compress";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import fastifyResponseValidation from "@fastify/response-validation";
import fastifyRateLimit from "@fastify/rate-limit";
import { getUserUsage } from "./utils/usage.ts";

const ALLOWED_ORIGINS = new Set([
  "https://restaurant-management-syste-git-9f0028-chughtaiburhans-projects.vercel.app",
]);

const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^chrome-extension:\/\/[a-z0-9]{32}$/,
  /^https:\/\/[^.]+\.ngrok-free\.(app|dev)$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/,
];

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
}

export async function buildApp() {
  const fastify = Fastify({ logger: true });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET is missing from environment");

  await fastify.register(fastifyHelmet);

  await fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      if (!origin || origin === "null") return cb(null, true);
      if (isOriginAllowed(origin)) return cb(null, true);

      const err = Object.assign(
        new Error(`CORS: origin '${origin}' is not permitted`),
        { statusCode: 403 }
      );

      return cb(err, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-device-id"],
    credentials: true,
    maxAge: 600,
  });

  await fastify.register(fastifyCompress);
  await fastify.register(fastifyCookie);

  await fastify.register(fastifyJwt, {
    secret: jwtSecret,
    sign: { algorithm: "HS256" },
  });

  await fastify.register(fastifyRateLimit, {
    global: false,
    max: async (req) => {
      const deviceId = req.headers["x-device-id"] as string | undefined;
      if (!deviceId) return 0;

      try {
        const usage = await getUserUsage(deviceId);
        const remaining = usage.freeTokensLimit - usage.dailyTokensUsed;
        return Math.max(0, Math.floor(remaining / 500));
      } catch {
        return 100;
      }
    },
    timeWindow: 24 * 60 * 60 * 1000,
    keyGenerator: (req) =>
      (req.headers["x-device-id"] as string) || req.ip || "unknown",
    errorResponseBuilder: () => ({
      success: false,
      statusCode: 429,
      message:
        "Daily free token limit exceeded. Upgrade your plan to continue.",
    }),
  });

  await fastify.register(fastifyResponseValidation);

  fastify.setErrorHandler(
    (error: FastifyError, _req, reply) => {
      const statusCode = error.statusCode ?? 500;

      const message =
        statusCode < 500
          ? error.message
          : "An unexpected error occurred. Please try again.";

      fastify.log.error({ err: error, statusCode }, error.message);

      return reply.status(statusCode).send({
        success: false,
        statusCode,
        message,
      });
    }
  );

  return fastify;
}