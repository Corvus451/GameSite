const WebSocket = require("ws");
const { URL } = require("url");
const redisClient = require("./services/redis.js");
const { authenticate } = require("./services/auth.js");
const { broadcastMessage } = require("./gamelogic/chat.js");
const { SERVER_PORT } = require("./config/config.js");


const setup = async () => {

    // Store connected clients in arrays that can be referenced by lobby_id
    const clientLists = new Map();

    await redisClient.connectRedis();

    const wss = new WebSocket.Server({ port: SERVER_PORT });

    const heartBeat = (ws) => {
        console.log("Heartbeat is called, client alive: " + ws.isAlive);
        ws.isAlive = true;
    }

    // Function to call when an other server published something on redis
    const handleRedisMessage = (parsed, channel) => {

        switch (parsed.message.type) {
            case "chatmessage":
            case "system-message":
                broadcastMessage(clientLists.get(parsed.lobby_id), null, parsed.message);
                break;

            case "lobbydeleted":
                const clients = clientLists.get(parsed.lobby_id);
                clients.forEach(client => {
                    client.close(1000, JSON.stringify({type: "lobbydeleted", message: "Lobby deleted"})); // Close every connection in this lobby.
                });
                redisClient.redisUnsetMessageHandler(channel); // Unsubscribe from this channel
                clientLists.delete(parsed.lobby_id); // Remove the client list of this lobby.
                break;

            default:
                console.log("message type is unhandled");
                break;
        }
    }

    wss.on("connection", async (ws, req) => {

        console.log("User connecting");

        // Get lobby_id and sessionToken from connection url
        const url = new URL(req.url, `http://${req.headers.host}`);
        const lobbyId = url.searchParams.get("lobbyid");
        const sessionToken = url.searchParams.get("sessiontoken");

        // Get lobby data.
        const lobby = await redisClient.redisGetLobbyById(lobbyId);

        if (!lobby) {
            ws.close(4000, JSON.stringify({ type: "error", message: "Lobby not found" }));
            return;
        }
        if (!sessionToken) {
            ws.close(4000, JSON.stringify({ type: "error", message: "Mising sessionToken" }));
            return;
        }

        // Authenticate client
        const userData = await authenticate(sessionToken);

        if (!userData) {
            ws.close(4000, JSON.stringify({ type: "error", message: "Invalid sessionToken" }));
            return;
        }
        
        // Set the handleRedisMessage function to be called by the subscriber client
        redisClient.redisSetMessageHandler(handleRedisMessage, "lobby:"+lobbyId);

        console.log(userData.username + " connected");

        // Set these variables for the client
        ws.userData = userData;
        ws.lobby_id = lobby.lobby_id;
        ws.isAlive = true;

        // Get the client list for this lobby.
        const clients = clientLists.get(lobbyId);

        if (!clients) {
            clientLists.set(lobbyId, [ws]); // If it doesn't exist, create it and add the current client to it.
        }
        else {
            clients.push(ws); // If i exists, just add the current client to it. 
        }

        // Send lobby data to client, so it can view the previous messages.
        ws.send(JSON.stringify({
            type: "lobbydata",
            lobby: lobby
        }));

        // Notify the lobby that a user is connected.
        const message = {
            type: "system-message",
            message: userData.username + " connected."
        };
        broadcastMessage(clientLists.get(lobbyId), null, message);
        redisClient.redisAddChatMessage(lobbyId, message);

        ws.on("message", (message) => {

            const parsed = JSON.parse(message);

            if (!parsed.type || !parsed.message) {
                ws.send(JSON.stringify({ type: "error", message: "Message incomplete" }));
                return;
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

        ws.on("pong", () => heartBeat(ws));

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

    const interval = setInterval(() => {
        
        wss.clients.forEach((client) => {

            console.log("Checking client " + client.userData.username);
            console.log(client.isAlive);

            if(!client.isAlive){
                console.log("Client timed out.");
                return client.terminate();
            }

            client.isAlive = false;
            client.ping();
        })
    }, 25000);
}

setup();