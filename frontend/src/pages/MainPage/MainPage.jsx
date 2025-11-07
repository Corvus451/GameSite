import { useContext, useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { SettingsContext } from "../../main";
import UsernameDisplay from "./UsernameDisplay";
import CreateLobby from "./CreateLobby";
import LobbyList from "../../components/lobbyList/LobbyList";
import ChatPanel from "../../components/chat/ChatPanel";
import LobbyMenu from "../../components/LobbyMenu/LobbyMenu";

const MainPage = () => {

    const [settings, setSettings] = useContext(SettingsContext);
    const [loading, setLoading] = useState(true);
    const [ws, setWs] = useState(null);
    const [lobbyData, setLobbyData] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {

         async function checkToken() {

            const result = await fetch("/api/auth_v1/refreshtoken", { method: "POST" });
            const data = await result.json();

            if (!result.ok) {
                navigate("/login");
            }
            else {
                setSettings({
                    username: data.user.username,
                    user_id: data.user.user_id,
                    loggedIn: true,
                    sessionToken: data.sessionToken,
                    sessionExp: data.sessionExp
                });
                setLoading(false);
            }
        }
        checkToken();
    }, []);

    const logout = async ()=> {
        const result = await fetch("/api/auth_v1/logout", {
            method: "POST"
        });
        if(ws?.readyState === WebSocket.OPEN) {
            ws.close(1000, "Disconnected by user");
            setWs(null);
        }
        setSettings({});
        navigate("/login");

    }

    const handleDeleteLobby = () => {
        if(lobbyData?.owner_id === settings.user_id){
            ws?.send(JSON.stringify({type: "lobby-action", action: "delete-lobby"}));
        }
    }

    const joinLobby = (lobby_id) => {
        console.log("connecting to lobby " + lobby_id);
        if(ws?.readyState === WebSocket.OPEN) {
            ws.close(1000, "Disconnected by user");
            setWs(null);
        }
        
        const websocket = new WebSocket(`ws://${window.location.host}/game?lobbyid=${lobby_id}&sessiontoken=${settings.sessionToken}`);

        websocket.onopen = () => {
            setWs(websocket);
            console.log("Connected to GameServer");
            // open chat panel
        }

        websocket.addEventListener("message", (message) => {
            const parsed = JSON.parse(message.data);

            if(parsed?.type === "lobbydata"){
                setLobbyData(parsed.lobby);
            }
        });

        websocket.onclose = (close) => {
            alert("Disconnected:" + close.reason);
            // close chat panel
            setWs(null);
            setLobbyData(null);
        }
    }

    return (<>
        <div className="sidepanel">
            <UsernameDisplay handlelogout={logout}/><hr />
            <CreateLobby/>
            {(!loading && !lobbyData) && (<><LobbyList handleJoinLobby={joinLobby}/></>)}
            {lobbyData && <LobbyMenu lobbyData={lobbyData} handleDelete={handleDeleteLobby}/>}
        </div>
        <hr />

        <div className="mainpanel">

            <nav>
                <ul>
                    <h2>Placeholder</h2>
                </ul>
            </nav>
            <Outlet />
        </div>
        
        {ws && <><hr /> <ChatPanel ws={ws} setWs={setWs}/></>}
    </>
    )


}

export default MainPage;
