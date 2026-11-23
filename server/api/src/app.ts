
import Fastify from "fastify";
import cardsRoutes from "./routes/cards.js";

const app = Fastify({
  logger: true,
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "fourfold-api",
  };
});

app.register(cardsRoutes, {
  prefix: "/api/cards",
});

export default app;
