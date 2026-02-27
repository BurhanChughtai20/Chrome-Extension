import type { FastifyInstance } from "fastify";
import BillingRoute from "./billing.route.ts";
import ToneAdjusterRoute from "./toneAdjuster.route.ts";
import LanguageOptimizerRoute from "./languageOptimizer.route.ts";
import TextFormatterRoute from "./textFormate.route.ts";
export async function registerRoutes(fastify: FastifyInstance) {
  const API_PREFIX = process.env.API_PREFIX || "/v2";

  const routes: { module: any; prefix: string }[] = [
    { module: TextFormatterRoute, prefix: `${API_PREFIX}/text` },
    { module: ToneAdjusterRoute, prefix: `${API_PREFIX}/tone` },
    { module: LanguageOptimizerRoute, prefix: `${API_PREFIX}/language` },
    { module: BillingRoute, prefix: `${API_PREFIX}/billing` },
   ];
  await Promise.all(
    routes.map(({ module, prefix }) => fastify.register(module, { prefix })),
  );
}