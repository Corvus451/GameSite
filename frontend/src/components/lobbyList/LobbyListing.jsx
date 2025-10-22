const LobbyListing = ({ lobby_id, lobby_name, handleJoinLobby}) => {


    return (
        <div className="listitem" key={lobby_id}>
            {lobby_name}<button className="joinbutton" onClick={()=> handleJoinLobby(lobby_id)}>Join</button>
        </div>
    )
}

export default LobbyListing;