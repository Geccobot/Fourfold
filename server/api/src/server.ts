import app from "./app.js";

const start = async () => {
    try {
        const port = Number(process.env.PORT) || 3000;

        await app.listen({
            port,
            host: '0.0.0.0',
        });

        console.log(`\x1b[1;36m  Local:  \x1b[4;36mhttp://localhost:${port}\x1b[0m`);
        console.log(`\x1b[1;33m  Health: \x1b[4;33mhttp://localhost:${port}/health\x1b[0m`);


    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};

start();