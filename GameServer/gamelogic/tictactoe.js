const redisClient = require("../services/redis.js");

const gamestate = (userIds) => {

    return {
        players: userIds,
        nextPlayer: userIds[0],
        index: 0,
        board: [
            [null,null,null],
            [null,null,null],
            [null,null,null]
        ],
    }
}

const main = () => {

}

const gameLoop = () => {
    
}

const placeMarker = (gamestate, coord, user_id) => {

    const h = parseInt(coord[0]);
    const v = parseInt(coord[1]);

    if(gamestate.board[v][h] != null) {
        return false;
    }

    gamestate.board[v][h] = JSON.stringify(user_id);

    return true;
}

exports.start = (lobby) => {
    // place gameState into redis lobby object and publish it
    const newGame = gamestate(lobby.connected_users);

    redisClient.redisSetGameState(lobby.lobby_id, newGame);
    redisClient.redisPublishGamestate(lobby.lobby_id, newGame);
    return newGame;
}

const getRandomPlayer = () => {

}
// Todo gamestate redis, nextplayer id, browser handling of gamestate
exports.handleGameMove = async (lobby_id, user_id, move) => {

    const lobby =  await redisClient.redisGetLobbyById(lobby_id);

    if (!lobby?.gamestate) {
        console.log("no lobby.gamestate");
        return false;
    }
    
    if(user_id != lobby.gamestate.nextPlayer) {
        return false;
    }

    if(!move || !move?.type) {
        console.log("no move or move.type");
        return false;
    }

    switch (move.type) {
        case "place":
            const success = placeMarker(lobby.gamestate, move.coord, user_id);
            if (!success) {console.log("error at place"); return false;}
            break;
    
        default:
            break;
    }

    // Rotate next player id
    lobby.gamestate.index = (lobby.gamestate.index + 1) % 2;
    lobby.gamestate.nextPlayer = lobby.gamestate.players[lobby.gamestate.index];

    //update redis gamestate
    await redisClient.redisSetGameState(lobby_id, lobby.gamestate);
    await redisClient.redisPublishGamestate("lobby:"+lobby_id, lobby.gamestate);

    return lobby.gamestate;
    
}
