const redisClient = require("../services/redis.js");

const gamestate = (userIds) => {

    return {
        players: userIds,
        nextPlayer: userIds[0],
        index: 0,
        end: false,
        winner: null,
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

    gamestate.board[v][h] = user_id;

    return true;
}

const checkWinner = (board, player) => {

    for(let i=0; i<=2; i++) {
        if(board[0][i] === player && board[1][i] === player && board[2][i] === player) { return true; }
        if(board[i][0] === player && board[i][1] === player && board[i][2] === player) { return true; }
    }
    if(board[0][0] === player && board[1][1] === player && board[2][2] === player) { return true; }
    if(board[0][2] === player && board[1][1] === player && board[2][0] === player) { return true; }

    return false;
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
        return {type: "error", message: "game not started", broadcast: false};
    }

    if(lobby?.gamestate.winner !== null) {
        return {type: "error", message: "game ended", broadcast: false};
    }
    
    if(user_id != lobby.gamestate.nextPlayer) {
        return {type: "error", message: "not your turn", broadcast: false};
    }

    if(!move || !move?.type) {
        console.log("no move or move.type");
        return {type: "error", message: "no move or move.type", broadcast: false};
    }



    switch (move.type) {
        case "place":
            const success = placeMarker(lobby.gamestate, move.coord, user_id);
            if (!success) {console.log("error at place"); return {type: "error", message: "slot used", broadcast: false};}
            break;
    
        default:
            break;
    }

    let result;

    // check winner
    if(checkWinner(lobby.gamestate.board, user_id)) {
        console.log(user_id, " win");
        // lobby.gamestate.end = true;
        lobby.gamestate.winner = user_id;
        console.log(lobby.gamestate.end);
        result = {type: "game-state", winner: user_id, gamestate: lobby.gamestate, broadcast: true};
    }
    else {
        // Rotate next player id
        lobby.gamestate.index = (lobby.gamestate.index + 1) % 2;
        lobby.gamestate.nextPlayer = lobby.gamestate.players[lobby.gamestate.index];
        result = {type: "game-state", gamestate: lobby.gamestate, broadcast: true};
    }


    //update redis gamestate
    await redisClient.redisSetGameState(lobby_id, lobby.gamestate);
    await redisClient.redisPublishGamestate("lobby:"+lobby_id, lobby.gamestate);

    return result;
    
}
