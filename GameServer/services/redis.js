const { REDIS_HOST, REDIS_PORT} = require("../config/config.js");
const { createClient } = require("redis");

const subscribedChannels = new Set();

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
exports.redisSetMessageHandler = (handler, channel) => {
    if(subscribedChannels.has(channel)) {
        return;
    }
    subscribedChannels.add(channel);
    redisSubscriber.subscribe(channel, (message)=> {
        handler(message, channel);
    })
}

exports.redisUnsetMessageHandler = (channel) => {
    redisSubscriber.unsubscribe(channel);
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

exports.redisDeleteLobby = async (lobby_id) => {
    const result = await redisClient.json.del("lobby:"+lobby_id);
    await redisClient.lRem("lobby:list", 0, "lobby:"+lobby_id);
    await redisClient.publish("lobby:"+lobby_id, JSON.stringify({type: "lobbydeleted", lobby_id: lobby_id}));
    return result;
}

exports.redisAddChatMessage = async (lobby_id, message) => {
    const result = await redisClient.json.arrAppend("lobby:"+lobby_id, "$.messages", message);
    await redisClient.publish("lobby:"+lobby_id, JSON.stringify({lobby_id: lobby_id, message: message}));
    // !! todo Separate channels by lobby !!
    return result;
}
