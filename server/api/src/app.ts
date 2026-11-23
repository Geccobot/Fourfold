import Fastify from 'fastify';

const app = Fastify({
    logger: true,
});

app.get('/health', async () => {
    return {
        status: 'ok',
        service: 'fourfold-api',
    };
});

export default app;