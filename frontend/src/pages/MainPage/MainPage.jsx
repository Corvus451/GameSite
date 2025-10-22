import { useContext, useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { SettingsContext } from "../../main";
import UsernameDisplay from "./UsernameDisplay";
import CreateLobby from "./CreateLobby";
import LobbyList from "../../components/lobbyList/LobbyList";
import ChatPanel from "../../components/chat/ChatPanel";

const MainPage = () => {

    const [settings, setSettings] = useContext(SettingsContext);
    const [loading, setLoading] = useState(true);
    const [ws, setWs] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {

        if(settings.loggedIn){
            console.log("already logged in");
            return;
        }

        async function checkToken() {

            const result = await fetch("/api/auth_v1/refreshtoken", { method: "POST" });
            const data = await result.json();

            if (!result.ok) {
                navigate("/login");
            }
            else {
                setSettings({
                    username: data.user.username,
                    loggedIn: true,
                    sessionToken: data.sessionToken
                });
                setLoading(false);
            }
        }
        checkToken();
    }, []);

    const sendMessage = (msg) => {

        const message = {
            type: "chatmessage",
            message: msg
        };

        ws.send(JSON.stringify(message));

    }

    const addChatMessage = (name, message) => {

    }

    const joinLobby = (lobby_id) => {
        console.log("connecting to lobby " + lobby_id);
        const websocket = new WebSocket(`ws://localhost:3333?lobbyid=${lobby_id}&sessiontoken=${settings.sessionToken}`);
        websocket.onopen = () => {
            setWs(websocket);
            console.log("Connected to GameServer");
            // open chat panel
        }
        websocket.onclose = (close) => {
            alert("Lobby closed:" + close.reason);
            // close chat panel
        }
    }

    return (<>
        <div className="sidepanel">
            <UsernameDisplay /><hr />
            <CreateLobby/><hr />
            {!loading && (<><LobbyList handleJoinLobby={joinLobby}/><hr /></>)}
        </div>

        <div className="mainpanel">

            <nav>
                <ul>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/register">Register</Link></li>
                </ul>
            </nav>
            <Outlet />
        </div>
        {ws && <ChatPanel ws={ws} />}
    </>
    )


}

export default MainPage;
