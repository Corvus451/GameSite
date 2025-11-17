const redisClient = require("../services/redis.js");
const { authenticate } = require("../services/auth.js");
const { URL } = require("url");
const gameLogic = require("../gamelogic/tictactoe.js");

const clientLists = new Map();

// Broadcast message to clients connected to this server
const broadcastMessage = (lobby_id, message) => {

    const clientList = clientLists.get(lobby_id);

    clientList?.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

const deleteLobby = (lobby_id, publish = false) => {

    const clients = clientLists.get(lobby_id);

    // Close every connection in this lobby.
    clients.forEach(client => {
        client.forceClose = true;
        client.close(1000, JSON.stringify({ type: "lobby-deleted", message: "Lobby deleted" }));
    });

    redisClient.redisUnsetMessageHandler("lobby:"+lobby_id); // Unsubscribe from this channel

    clientLists.delete(lobby_id); // Remove the client list of this lobby.
    if(publish) { redisClient.redisDeleteLobby(lobby_id); }
}

const handleLobbyAction = async (ws, parsed) => {

    const lobby = await redisClient.redisGetLobbyById(ws.lobby_id);

    if(lobby.owner_id !== ws.userData.user_id) {
        ws.send(JSON.stringify({type: "error", message: "unauthorized"}));
        return;
    }

    if(parsed.action === "delete-lobby") {
        deleteLobby(lobby.lobby_id, true);
        return;
    }

    if(parsed.action === "start-game") {
        const gamestate = gameLogic.start(lobby);
        broadcastMessage(lobby.lobby_id, {type: "game-started", gamestate: gamestate});
        return;
    }
}

const removeClientFromList = (ws) => {
    const clients = clientLists.get(ws.lobby_id);
    if(!clients) { return; }
    const index = clients.indexOf(ws);
    clients.splice(index, 1);
}

// Function to call when an other server published something on redis
const handleRedisMessage = (parsed, channel) => {

    switch (parsed.type) {
        case "chat-message":
        case "system-message":
            broadcastMessage(parsed.lobby_id, parsed.payload.message);
            break;

        case "lobby-deleted":
            deleteLobby(parsed.lobby_id, false);
            break;

        default:
            console.log("message type is unhandled");
            break;
    }
} // todo: handle client-removed publish, game-started publish

const handleChatMessage = (ws, parsed) => {

    const messageToSend = {
        type: parsed.type,
        message: parsed.message,
        username: ws.userData.username
    }

    // broadcastMessage is for clients connected to this server
    broadcastMessage(ws.lobby_id, messageToSend);
    // redisAddChatMessage is for notifying the other servers to broadcast the message
    redisClient.redisAddChatMessage(ws.lobby_id, messageToSend);
}

exports.wsJoin = async (ws, req) => {

    // Get lobby_id and sessionToken from connection url
    const url = new URL(req.url, `http://${req.headers.host}`);
    const lobbyId = url.searchParams.get("lobbyid");
    const sessionToken = url.searchParams.get("sessiontoken");

    // Get lobby data.
    const lobby = await redisClient.redisGetLobbyById(lobbyId);

    
    // Validations
    if (!lobby) {
        ws.forceClose = true;
        ws.close(4000, JSON.stringify({ type: "error", message: "Lobby not found" }));
        return false;
    }
    if (!sessionToken) {
        ws.forceClose = true;
        ws.close(4000, JSON.stringify({ type: "error", message: "Mising sessionToken" }));
        return false;
    }

    // Authenticate client
    const userData = await authenticate(sessionToken);
    
    if (!userData) {
        ws.forceClose = true;
        ws.close(4000, JSON.stringify({ type: "error", message: "Invalid sessionToken" }));
        return false;
    }

    // Get the client list for this lobby.
    const clients = clientLists.get(lobby.lobby_id);


    // check if lobby is full.
    if(clients?.length >= lobby.max_clients){
        ws.forceClose = true;
        ws.close(4000, JSON.stringify({ type: "error", message: "Lobby is full" }));
    }

    // Set the handleRedisMessage function to be called by the subscriber client
    redisClient.redisSetMessageHandler(handleRedisMessage, "lobby:" + lobbyId);

    console.log(userData.username + " connected");
    
    // Set these variables for the client
    ws.userData = userData;
    ws.lobby_id = lobby.lobby_id;
    ws.isAlive = true;
    
    // Add user id to redis lobby.connected_users
    redisClient.redisAddUserToLobby(lobby.lobby_id, userData.user_id);

    // Get the client list for this lobby.
    // const clients = clientLists.get(lobby.lobby_id);

    if (!clients) {
        clientLists.set(lobbyId, [ws]); // If it doesn't exist, create it and add the current client to it.
    }
    else {
        clients.push(ws); // If it exists, just add the current client to it. 
    }

    // Send lobby data to client, so it can view the previous messages.
    ws.send(JSON.stringify({
        type: "lobbydata",
        lobby: lobby
    }));

    // Notify the lobby that a user is connected.
    const message = {
        type: "system-message",
        message: ws.userData.username + " connected."
    };
    broadcastMessage(lobbyId, message);
    redisClient.redisAddChatMessage(lobbyId, message);

    return true;

}

exports.wshandleClose = (ws) => {

    if(ws.forceClose) { return; }

    const message = {
        type: "system-message",
        message: ws.userData.username + " disconnected."
    }
    // Remove client from local client list
    removeClientFromList(ws);
    // Remove client from redis lobby.connected_users
    redisClient.redisRemoveUserFromLobby(ws.lobby_id, ws.userData.user_id);
    
    broadcastMessage(ws.lobby_id, message);
    redisClient.redisAddChatMessage(ws.lobby_id, message);

}



exports.wsMessage = (ws, message) => {

    const parsed = JSON.parse(message);

    if (!parsed.type) {
        ws.send(JSON.stringify({ type: "error", message: "Message incomplete" }));
        return;
    }

    const type = parsed.type;

    switch (type) {
        case "chat-message":
            handleChatMessage(ws, parsed);
            break;
        case "lobby-action":
            handleLobbyAction(ws, parsed);
            break;
        case "game-move":
            gameLogic.handleGameMove(ws.userData.user_id, parsed.move);
            break;
        default:
            break;
    }

}