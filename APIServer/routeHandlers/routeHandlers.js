const { Lobby } = require("../models/Lobby");
const { nanoid } = require("nanoid");
const { internalServerError, badRequest } = require("../utilities/errorHandlers.js");
const { redisCreateLobby, redisGetPublicLobbies } = require("../services/redis.js");


exports.createLobby = async (req, res) => {

    try {
        const { lobby_name, public } = req.body;

        if(!lobby_name) {
            return badRequest(res, "Mising lobby name");
        }
    
        const newLobby = Lobby(
            nanoid(8),
            lobby_name,
            public,
            req.user.user_id
        );

        const result = await redisCreateLobby(newLobby);

        if(result !== "OK"){
            return internalServerError(result, res);
        }

        return res.status(201).json({
            success: true,
            message: "Lobby created",
            lobby_id: newLobby.lobby_id
        });
        
    } catch (error) {
        internalServerError(error, res);
    }
}

exports.getPublicLobbies = async (req, res) => {
    try {
        const lobbies = await redisGetPublicLobbies();
        console.log(lobbies);

        res.status(200).json({
            success: true,
            message: "ok",
            lobbies: lobbies
        });
    } catch (error) {
        internalServerError(error, res);
    }
}

