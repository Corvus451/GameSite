exports.Lobby = (lobby_id, lobby_name, public, owner_id) => {
    return {
        lobby_id: lobby_id,
        lobby_name: lobby_name,
        public: public,
        owner_id: owner_id,
        max_clients: 2,
        connected_users: [],
        messages: []
    }
}