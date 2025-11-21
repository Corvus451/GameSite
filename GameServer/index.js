const WebSocket = require("ws");
const { URL } = require("url");
const http = require("http");
const redisClient = require("./services/redis.js");
const { authenticate } = require("./services/auth.js");
const { broadcastMessage } = require("./wsHandlers/wsHandlers.js");
const { SERVER_PORT, HTTP_PORT } = require("./config/config.js");
const wsHandler = require("./wsHandlers/wsHandlers.js");


const setup = async () => {

    const httpServer = http.createServer((req, res) => {
        if(req.url === "/health") {
            console.log("Health endpoint reached.");
            res.writeHead(200, {'content-type': 'text/plain'});
            res.end("OK");
        } else {
            res.writeHead(404);
            res.end();
        }
    });

    await redisClient.connectRedis();

    const wss = new WebSocket.Server({ port: SERVER_PORT });

    const heartBeat = (ws) => {
        ws.isAlive = true;
    }

    wss.on("connection", async (ws, req) => {

        console.log("User connecting");

        const joinSuccess = await wsHandler.wsJoin(ws, req);

        if(!joinSuccess) { return; }

        ws.on("message", (message) => {
            wsHandler.wsMessage(ws, message);
        });

        ws.on("pong", () => heartBeat(ws));

        ws.on("close", () => {
            wsHandler.wshandleClose(ws);
        });

    });

    const interval = setInterval(() => {
        
        wss.clients.forEach((client) => {

            if(!client.isAlive){
                console.log("Client " + client.userData.username + " timed out.");
                client.terminate();
                wsHandler.wshandleClose(client);
                return;
            }

            client.isAlive = false;
            client.ping();
        })
    }, 25000);

    httpServer.listen(HTTP_PORT, () => {
        console.log(`HTTP server listening on port ${HTTP_PORT}`);
    });

    console.log(`WebSocket server listening on port ${SERVER_PORT}`);
}

setup();