import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { SettingsContext } from "../../main";
import LobbyListing from "./LobbyListing";

const LobbyList = ({ handleJoinLobby }) => {

    const [lobbies, setLobbies] = useState(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useContext(SettingsContext);

    const getLobbies = async () => {

        setLoading(true);

        const result = await fetch("/api/lobbies", {
            headers: {
                authorization: "Bearer " + settings.sessionToken
            }
        });

        const data = await result.json();
        console.log(data);

        if (!result.ok) {
            alert(data.message);
            return;
        }

        await setLobbies(data.lobbies);
        setLoading(false);


    }

    useEffect(() => {
        getLobbies();
    }, []);

    const joinLobby = (lobby_id) => {
        console.log(lobby_id);
    }

    // const refresh = async () => {
    //     getLobbies();
    // }

    if (loading) {
        return <h2>Loading</h2>
    }

    return (
        <div className="container column" id="lobbylist">
            <h3 className="sectiontitle">Lobbies</h3>
            <button onClick={getLobbies}>Refresh</button>
            {
                lobbies.map(l => <LobbyListing lobby_id={l.lobby_id} lobby_name={l.lobby_name} handleJoinLobby={handleJoinLobby}/>)
            }
        </div>
    )
}

export default LobbyList;