// lib/setErrorHandler.ts

import { FastifyInstance, FastifyError } from "fastify";
import fp from "fastify-plugin";

async function setErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError, req, reply) => {
    req.log.error(error);

    const isProduction = process.env.NODE_ENV === "production";

    let statusCode = error.statusCode ?? 500;
    let message = "Internal Server Error";
    let code = "INTERNAL_ERROR";

    if ((error as any).validation) {
      return reply.status(400).send({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        errors: (error as any).validation,
      });
    }

    if (error.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER") {
      return reply.status(401).send({
        success: false,
        code: "AUTH_REQUIRED",
        message: "Authorization token required",
      });
    }

    if (error.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED") {
      return reply.status(401).send({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Session expired. Please login again.",
      });
    }

    if (error.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID") {
      return reply.status(401).send({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid authorization token",
      });
    }

    if (statusCode === 429) {
      return reply.status(429).send({
        success: false,
        code: "DAILY_LIMIT_EXCEEDED",
        message:
          "Daily usage limit exceeded. Please upgrade your plan.",
      });
    }

    if (statusCode >= 400 && statusCode < 500) {
      message = error.message || "Bad Request";
      code = "CLIENT_ERROR";
    }

    if (statusCode >= 500) {
      message = isProduction
        ? "Something went wrong. Please try again later."
        : error.message;

      code = "SERVER_ERROR";
    }

    return reply.status(statusCode).send({
      success: false,
      code,
      message,
      ...(isProduction ? {} : { stack: error.stack }),
    });
  });
}

export default fp(setErrorHandler);
