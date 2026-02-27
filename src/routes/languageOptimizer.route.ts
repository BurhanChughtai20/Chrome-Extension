import { FastifyInstance } from "fastify";

async function LanguageOptimizerRoute(fastify: FastifyInstance) {
  function registerPost<T extends object>(
  path: string,
  handler: (body: T) => Promise<any>,
) {
  fastify.post<{ Body: T }>(path, async (req, reply) => {
    const body = req.body as T;

    const result = await handler(body);

    return reply.send({
      success: true,
      data: result,
    });
  });
}


}

export default LanguageOptimizerRoute;