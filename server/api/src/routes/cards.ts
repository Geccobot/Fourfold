
import type { FastifyPluginAsync } from "fastify";
import { CARD_REGISTRY } from "@fourfold/game-engine/cards";

const cardsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => {
    return Object.values(CARD_REGISTRY);
  });
};

export default cardsRoutes;
