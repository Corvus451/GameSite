const redisClient = require("../services/redis.js");

const gamestate = (userIds) => {

    const kvArray = [
        [userIds[0], 'o'],
        [userIds[1], 'x']
    ];

    return {
        // nextPlayerId: null,
        next: 0,
        board: [
            ['.','.','.'],
            ['.','.','.'],
            ['.','.','.']
        ],
        markers: new Map(kvArray)

    }
}

const main = () => {

}

const gameLoop = () => {
    
}

const placeMarker = (gamestate, coord, user_id) => {

    const h = coord[0];
    const v = coord[1];

    if(gamestate.board[v][h] != '.') {
        return false;
    }

    gamestate.board[v][h] = gamestate.markers.get(user_id);

    return true;
}

exports.start = (lobby) => {
    // place gameState into redis lobby object and publish it
    const newGame = gamestate(lobby.connected_users);
    // newGame.nextPlayerId = lobby.connected_users[0];
    // newGame.markers.set(lobby.connected_users[0], 'o');
    // newGame.markers.set(lobby.connected_users[1], 'x');
    redisClient.redisJsonSet("lobby:"+lobby.lobby_id, "$.gamestate", newGame);
    redisClient.redisPublishGamestate(lobby.lobby_id, newGame);
    return newGame;
}

const getRandomPlayer = () => {

}

exports.handleGameMove = async (lobby_id, user_id, move) => {

    const lobby =  await redisClient.redisGetLobbyById(lobby_id);

    if (!lobby?.gamestate) {
        return false;
    }
    
    if(user_id != lobby.connected_users[lobby.gamestate.next]) {
        return false;
    }

    if(!move || !move?.type) {
        return false;
    }

    switch (move.type) {
        case "place":
            placeMarker(lobby.gamestate, move.coord, user_id);
            break;
    
        default:
            break;
    }

    // Rotate next player id
    lobby.gamestate.next = (lobby.gamestate.next + 1) % 2;

    //update redis gamestate
    await redisClient.redisJsonSet("lobby:"+lobby_id, "$.gamestate", lobby.gamestate);
    await redisClient.redisPublishGamestate("lobby:"+lobby_id, lobby.gamestate);

    return lobby.gamestate;
    
}

// exports.handleGameMove = (player, move) => {

//     switch (move.type) {
//         case "place":
            
//             break;
    
//         default:
//             break;
//     }

// }