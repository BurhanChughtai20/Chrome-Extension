import { FastifyInstance } from "fastify";
import { FormatterText } from "../types/text.interface.ts";
import { formatTextController } from "../controllers/text-formatter.controller.ts";

async function TextFormatterRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: FormatterText }>("/clean", async (req, reply) => {
    const result = await formatTextController(req.body);

    return reply.send({
      success: true,
      data: result,
    });
  });
};

export default TextFormatterRoute;
