const LobbyMenu = ({ lobbyData, handleDelete, handleStartGame}) => {


    return (
        <div className="container column">
            <div className="flex row">
                <h3>{lobbyData.lobby_name}</h3>
                <span>{lobbyData.lobby_id}</span>
            </div>
            <div>
                <button onClick={handleDelete}>Delete lobby</button>
                <button onClick={handleStartGame}>Start</button>
            </div>
        </div>
    );
}

export default LobbyMenu;