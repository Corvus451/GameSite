const { REDIS_HOST, REDIS_PORT, DEVENV} = require("../config/config.js");
const { createClient } = require("redis");
const os = require("os");

const HOSTNAME = os.hostname();

const rcStrategy = (retries) => {

    if(retries > 5) {
        console.log("Cannot connect to redis server, exiting...");
        process.exit(1);
    }

    return 1000;
}

// Track which channels this server has subscribed to.
const subscribedChannels = new Set();

const redisClient = createClient({
        socket: {
            host: REDIS_HOST,
            port: REDIS_PORT,
            ...(DEVENV === "yes" ? {} : { tls: true }),
            reconnectStrategy: rcStrategy
        }
});

const redisSubscriber = redisClient.duplicate();

redisClient.on("error", (error)=> console.error("Redis Client error:", error));
redisSubscriber.on("error", (error)=> console.error("Redis Subscriber error:", error));

exports.connectRedis = async () => {
    if(!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Client connected to redis");
    }
    if(!redisSubscriber.isOpen) {
        await redisSubscriber.connect();
        console.log("Subscriber connected to redis");
    }
}

// Subscribe to a redis channel and set a handler function for the incoming publishes.
exports.redisSetMessageHandler = (handler, channel) => {

    if(subscribedChannels.has(channel)) { // Avoid subscribing to the same channel multiple times.
        return;
    }

    subscribedChannels.add(channel);

    redisSubscriber.subscribe(channel, (message)=> {

        
        const parsed = JSON.parse(message);

        // console.log("HOSTNAME: " + parsed.hostname);
        
        if(parsed.host !== HOSTNAME) { // ignore the publish if it's sent by this server.
            handler(parsed, channel);
        }
    });
}

exports.redisUnsetMessageHandler = (channel) => {
    redisSubscriber.unsubscribe(channel);
    subscribedChannels.delete(channel);
}

exports.redisGetLobbyById = async (id) => {
    const lobby = await redisClient.json.get("lobby:"+id, "$") || null;
    return lobby;
}

const publish = async (lobby_id, type, payload) => {
    const result = await redisClient.publish("lobby:"+lobby_id, JSON.stringify({
        type: type,
        host: HOSTNAME,
        lobby_id: lobby_id,
        payload: payload
    }));
    return result;
}

exports.redisDeleteLobby = async (lobby_id) => {
    //Delete the lobby object from redis.
    const result = await redisClient.json.del("lobby:"+lobby_id);

    //Delete the lobby reference from the redis list.
    await redisClient.lRem("lobby:list", 0, "lobby:"+lobby_id);

    //Publish lobby deletion for the other servers. Add hostname so the server can ignore it's own publishes.
    // await redisClient.publish("lobby:"+lobby_id, JSON.stringify({type: "lobby-deleted",  host: HOSTNAME ,lobby_id: lobby_id}));
    await publish(lobby_id, "lobby-deleted", null);
    return result;
}

// Publish message to redis for the other servers. 
exports.redisAddChatMessage = async (lobby_id, message) => {

    //Add the chat message to the redis lobby object
    const result = await redisClient.json.arrAppend("lobby:"+lobby_id, "$.messages", message);

    //Publish The message on the right channel. Add hostname so the server can ignore it's own publishes.
    // await redisClient.publish("lobby:"+lobby_id, JSON.stringify({type: "chat-message", lobby_id: lobby_id, host: HOSTNAME, message: message}));
    await publish(lobby_id, "chat-message", {message: message});
    return result;
}

exports.redisAddUserToLobby = async (lobby_id, user_id) => {
    const result = await redisClient.json.arrAppend("lobby:"+lobby_id, "$.connected_users", JSON.stringify(user_id));
    // redisClient.publish("lobby:"+lobby_id, JSON.stringify({type: "user-added", host: HOSTNAME, lobby_id: lobby_id, user_id: user_id}));
    await publish(lobby_id, "user-added", {user_id: user_id});
    return result;
}

exports.redisRemoveUserFromLobby = async (lobby_id, user_id) => {
    const lobby = await redisClient.json.get("lobby:"+lobby_id, "$");
    if(!lobby) { return false; }
    if(!lobby.connected_users) { return false; }
    if(!lobby.connected_users.includes(JSON.stringify(user_id))) { return false; }

    lobby.connected_users.splice(lobby.connected_users.indexOf(JSON.stringify(user_id)), 1);

    const result = await redisClient.json.set("lobby:"+lobby_id, "$.connected_users", lobby.connected_users);
    // redisClient.publish("lobby:"+lobby_id, JSON.stringify({type: "user-removed", host: HOSTNAME, lobby_id: lobby_id, user_id: user_id}));
    await publish(lobby_id, "user-removed", {user_id: user_id});
    return result;
}

exports.redisJsonSet = async (target, path, value) => {
    const result = await redisClient.json.set(target, path, JSON.stringify(value));
    return result;
};

exports.redisPublishGamestate = async (lobby_id, gamestate) => {
    const result = await publish(lobby_id, "game-state", {gamestate: gamestate});
    return result;
}

// exports.redisCreateLobby = async (lobby) => {
//     const result = await redisClient.json.set(`lobby:${lobby.lobby_id}`, "$", lobby);
//     await redisClient.rPush("lobby:list", "lobby:"+lobby.lobby_id);
//     return result;
// }

// exports.redisGetPublicLobbies = async () => {
//     const keys = await redisClient.lRange("lobby:list", 0, -1);
//     const lobbies = await Promise.all(keys.map(k => redisClient.json.get(k)));
//     console.log(lobbies);
//     const result = lobbies.filter(l => l.public === true);
//     return result;
// }
