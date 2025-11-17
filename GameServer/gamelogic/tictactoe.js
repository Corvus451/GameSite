const redisClient = require("../services/redis.js");

const gamestate = () => {
    return {
        // lobby_id: null,
        nextPlayerId: null,
        board: [
            ['.','.','.'],
            ['.','.','.'],
            ['.','.','.']
        ],

    }
}

const main = () => {

}

const gameLoop = () => {
    
}

exports.start = (lobby) => {
    // place gameState into redis lobby object and publish it
    const newGame = gamestate();
    newGame.nextPlayerId = lobby.connected_users[0];
    // newGame.lobby_id = lobby_id;
    redisClient.redisJsonSet("lobby:"+lobby.lobby_id, "$.gamestate", newGame);
    redisClient.redisPublishGamestate(lobby.lobby_id, newGame);
    return newGame;
}

const getRandomPlayer = () => {

}

const handleGameMove = () => {

}

exports.handleGameMove = (player, move) => {

    switch (move.type) {
        case "place":
            
            break;
    
        default:
            break;
    }

}