const WebSocket = require("ws");
const { URL } = require("url");
const redisClient = require("./services/redis.js");
const { authenticate } = require("./services/auth.js");
const { broadcastMessage } = require("./gamelogic/chat.js");

const setup = async () => {

    const clientLists = new Map();

    await redisClient.connectRedis();
    const wss = new WebSocket.Server({port: 3333});

    wss.on("connection", async (ws, req) => {
    
        const url = new URL(req.url, `http://${req.headers.host}`);
        const lobbyId = url.searchParams.get("lobbyid");
        const sessionToken = url.searchParams.get("sessiontoken");
    
        const lobby = await redisClient.redisGetLobbyById(lobbyId);

        if(!lobby){
            ws.close(4000, JSON.stringify({type: "error", message: "Lobby not found"}));
        }
        if(!sessionToken){
            ws.close(4000, JSON.stringify({type: "error", message: "Mising sessionToken"}));
        }

        // AUTHENTICATE CLIENT
        const userData = await authenticate(sessionToken);

        if(!userData){
            ws.close(4000, JSON.stringify({type: "error", message: "Invalid sessionToken"}));
        }

        ws.userData = userData;
        ws.lobby_id = lobby.lobby_id;

        const clients = clientLists.get(lobbyId);

        if(!clients){
            clientLists.set(lobbyId, [ws]);
        }
        else{
            clients.push(ws);
        }

        const message = {
            type: "system-message",
            message: userData.username + " connected."
        };

        broadcastMessage(clientLists.get(lobbyId), null, message);

        ws.on("message", (message) => {
            const parsed = JSON.parse(message);
            if(!parsed.type || !parsed.message){
                ws.send(JSON.stringify({type: "error", message: "Message incomplete"}));
            }

            const messageToSend = {
                type: parsed.type,
                message: parsed.message,
                username: ws.userData.username
            }

            broadcastMessage(clientLists.get(ws.lobby_id), ws, messageToSend);
            redisClient.redisAddChatMessage(ws.lobby_id, messageToSend);

        });

        ws.on("close", ()=> {
            const message = {
                type: "system-message",
                message: ws.userData.username + " disconnected."
            }
            const clients = clientLists.get(ws.lobby_id);
            const index = clients.indexOf(ws);
            clients.splice(index, 1);
            broadcastMessage(clients, ws, message);
        });
    });
}

setup();