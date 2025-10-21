const { REDIS_HOST, REDIS_PORT} = require("../config/config.js");
const { createClient } = require("redis");

const CHANNEL = "chat";

const redisClient = createClient({
        socket: {
            host: REDIS_HOST,
            port: REDIS_PORT,
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

// !! todo Add channel parameter to this function and separate channel by lobbies !!
exports.redisSetMessageHandler = (handler) => {
    redisSubscriber.subscribe(CHANNEL, (message)=> {
        console.log("Message received:");
        console.log(message);
        handler(message);
    })
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

exports.redisGetLobbyById = async (id) => {
    const lobby = await redisClient.json.get("lobby:"+id, "$") || null;
    return lobby;
}

exports.redisDeleteLobby = async (id) => {
    const result = await redisClient.json.del("lobby:"+id);
    await redisClient.lRem("lobby:list", 0, "lobby:"+id);
    result && await redisClient.publish(CHANNEL, JSON.stringify({type: "lobbydeleted", lobby_id: id}));
    return result;
}

exports.redisAddChatMessage = async (id, message) => {
    const result = await redisClient.json.arrAppend("lobby:"+id, "$.messages", message);
    result && await redisClient.publish(CHANNEL, JSON.stringify({type: "chatmessage", lobby_id: id, message: message}));
    // !! todo Separate channels by lobby !!
    return result;
}
