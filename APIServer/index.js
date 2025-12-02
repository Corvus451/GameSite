const express = require("express");
const { connectRedis } = require("./services/redis.js");
const { SERVER_PORT, ENDPOINT_PREFIX } = require("./config/config.js");
const { authHandler } = require("./services/auth.js");
const routes = require("./routeHandlers/routeHandlers.js");

const app = express();

app.use(express.json());

// ENDPOINTS

app.post(ENDPOINT_PREFIX + "/createlobby", authHandler, routes.createLobby);
app.get(ENDPOINT_PREFIX + "/lobbies", authHandler, routes.getPublicLobbies);
app.get("/health", routes.healthCheck);
app.get(ENDPOINT_PREFIX + "/test", routes.healthCheck);


const main = async () => {

    try {
        await connectRedis();

        app.listen(SERVER_PORT, '0.0.0.0', () => {
            console.log(`Server is listening at PORT ${SERVER_PORT}`);
        });

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();