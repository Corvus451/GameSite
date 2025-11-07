import { useContext } from "react";
import { useState } from "react"
import { SettingsContext } from "../../main";

const CreateLobby = () => {

    const [lobbyName, setLobbyName] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [settings, setSettings] = useContext(SettingsContext);

    const handleCreateLobby = async () => {

        const result = await fetch("/api/createlobby", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": "Bearer " + settings.sessionToken
            },
            body: JSON.stringify({
                lobby_name: lobbyName,
                public: isPublic,
                game: "tictactoe"
            })
        });

        const data = await result.json();

        alert(data.message);
        if(!result.ok){
            return;
        }
        setLobbyName("");
        setIsPublic(false);
    }

    return (
        <div id="createlobbymenu" className="container">
            <h3 className="sectiontitle">Create Lobby</h3>
            <div className="column">
                <label htmlFor="lobbyname">Lobby name</label>
                <input type="text" name="lobbyname" id="lobbyname" value={lobbyName} onChange={(e)=> setLobbyName(e.target.value)}/>
            </div>
            <div className="aic">
                <input type="checkbox" name="ispublic" id="ispublic" checked={isPublic} onChange={()=> setIsPublic(!isPublic)}/>
                <label htmlFor="ispublic">Public</label>
            </div>
            <button onClick={handleCreateLobby}>Create</button>
        </div>
    )
}

export default CreateLobby;