const { Lobby } = require("../models/Lobby");
const { nanoid } = require("nanoid");

exports.createLobby = async (req, res) => {

    const { lobby_name, public } = req.body;

    const newLobby = Lobby(
        nanoid(8),
        lobby_name,
        public,
        req.user.user_id
    );

    // CREATE LOBBY IN REDIS FROM HERE OR SEND newLobby TO GAME SERVER
}

