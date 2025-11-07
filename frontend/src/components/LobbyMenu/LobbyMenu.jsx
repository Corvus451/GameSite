const LobbyMenu = ({ lobbyData, handleDelete }) => {


    return (
        <div className="container column">
            <div className="flex row">
                <h3>{lobbyData.lobby_name}</h3>
                <span>{lobbyData.lobby_id}</span>
            </div>
            <div>
                <button onClick={handleDelete}>Delete lobby</button>
            </div>
        </div>
    );
}

export default LobbyMenu;