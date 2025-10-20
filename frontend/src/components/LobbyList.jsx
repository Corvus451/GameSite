import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { SettingsContext } from "../main";

const LobbyList = () => {

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

    const refresh = async () => {
        getLobbies();
    }

    if (loading) {
        return <h2>Loading</h2>
    }

    return (
        <div className="container column" id="lobbylist">
            <h3>Lobbies</h3>
            <button onClick={refresh}>Refresh</button>
            {
                lobbies.map(l => <div className="listitem" key={l.lobby_id}>{l.lobby_name}<button className="joinbutton">Join</button></div>)
            }
        </div>
    )
}

export default LobbyList;