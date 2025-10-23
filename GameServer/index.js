const WebSocket = require("ws");
const { URL } = require("url");
const redisClient = require("./services/redis.js");
const { authenticate } = require("./services/auth.js");
const { broadcastMessage } = require("./gamelogic/chat.js");



const setup = async () => {

    // Store connected clients in an arrays that can be referenced by lobby_id
    const clientLists = new Map();

    await redisClient.connectRedis();
    const wss = new WebSocket.Server({ port: 3333 });

    // Function to call when an other server published something on redis
    const handleRedisMessage = (message, channel) => {
        const parsed = JSON.parse(message);

        switch (parsed.type) {
            case "chatmessage":
                broadcastMessage(clientLists.get(parsed.lobby_id), null, parsed.message);
                break;

            case "lobbydeleted":
                const clients = clientLists.get(parsed.lobby_id);
                clients.forEach(client => {
                    client.close(1000, JSON.stringify({type: "lobbydeleted", message: "Lobby deleted"}));
                });
                redisClient.redisUnsetMessageHandler(channel);
                clientLists.delete(parsed.lobby_id);
                break;

            default:
                break;
        }
    }

    // Set the handleRedisMessage function to be called by the subscriber client
    // redisClient.redisSetMessageHandler(handleRedisMessage);


    wss.on("connection", async (ws, req) => {

        // Get lobby_id and sessionToken from connection url
        const url = new URL(req.url, `http://${req.headers.host}`);
        const lobbyId = url.searchParams.get("lobbyid");
        const sessionToken = url.searchParams.get("sessiontoken");

        const lobby = await redisClient.redisGetLobbyById(lobbyId);

        if (!lobby) {
            ws.close(4000, JSON.stringify({ type: "error", message: "Lobby not found" }));
            return;
        }
        if (!sessionToken) {
            ws.close(4000, JSON.stringify({ type: "error", message: "Mising sessionToken" }));
            return;
        }

        redisClient.redisSetMessageHandler(handleRedisMessage, "lobby:"+lobbyId);

        // Authenticate client
        const userData = await authenticate(sessionToken);

        if (!userData) {
            ws.close(4000, JSON.stringify({ type: "error", message: "Invalid sessionToken" }));
            return;
        }

        // Set these variables for the client
        ws.userData = userData;
        ws.lobby_id = lobby.lobby_id;

        const clients = clientLists.get(lobbyId);

        if (!clients) {
            clientLists.set(lobbyId, [ws]);
        }
        else {
            clients.push(ws);
        }

        const message = {
            type: "system-message",
            message: userData.username + " connected."
        };

        broadcastMessage(clientLists.get(lobbyId), null, message);

        ws.on("message", (message) => {
            const parsed = JSON.parse(message);
            if (!parsed.type || !parsed.message) {
                ws.send(JSON.stringify({ type: "error", message: "Message incomplete" }));
            }

            const messageToSend = {
                type: parsed.type,
                message: parsed.message,
                username: ws.userData.username
            }

            // broadcastMessage is for clients connected to this server
            broadcastMessage(clientLists.get(ws.lobby_id), ws, messageToSend);
            // redisAddChatMessage is for notifying the other servers to broadcast the message
            redisClient.redisAddChatMessage(ws.lobby_id, messageToSend);

        });

        ws.on("close", () => {
            const message = {
                type: "system-message",
                message: ws.userData.username + " disconnected."
            }
            const clients = clientLists.get(ws.lobby_id);
            const index = clients.indexOf(ws);
            clients.splice(index, 1);
            broadcastMessage(clients, null, message);
            redisClient.redisAddChatMessage(ws.lobby_id, message);
        });
    });
}

setup();