const { REDIS_HOST, REDIS_PORT, DEVENV} = require("../config/config.js");
const { createClient } = require("redis");

const redisClient = createClient({
        socket: {
            host: REDIS_HOST,
            port: REDIS_PORT,
            ...(DEVENV === "yes" ? {} : { tls: true })
        }
});

redisClient.on("error", (error)=> console.error("Redis error:", error));

exports.connectRedis = async () => {
    if(!redisClient.isOpen) {
        console.log("Connecting to redis");
        await redisClient.connect();
        console.log("Connected to redis");
    }
}

exports.redisCreateLobby = async (lobby) => {
    const result = await redisClient.json.set(`lobby:${lobby.lobby_id}`, "$", lobby);
    await redisClient.rPush("lobby:list", "lobby:"+lobby.lobby_id);
    return result;
}

exports.redisGetPublicLobbies = async () => {
    const keys = await redisClient.lRange("lobby:list", 0, -1);
    const lobbies = await Promise.all(keys.map(k => redisClient.json.get(k)));
    const result = lobbies.filter(l => l?.public === true);
    return result;
}

