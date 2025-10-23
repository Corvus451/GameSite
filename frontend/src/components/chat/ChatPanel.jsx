import { useContext, useState } from "react"
import { SettingsContext } from "../../main";
import ChatMessage from "./ChatMessage";

const ChatPanel = ({ ws, setWs }) => {

    const [lobbyName, setLobbyname] = useState("");
    const [settings, setSettings] = useContext(SettingsContext);
    const [chatHistory, setChatHistory] = useState([]);
    const [msg, setMsg] = useState("");

    const addChatMessage = async (name, message) => {
        await setChatHistory([...chatHistory, {username: name, message: message}]);

    }

    const sendMessage = (msg) => {

        const message = {
            type: "chatmessage",
            message: msg
        };

        ws.send(JSON.stringify(message));

        addChatMessage(settings.username, msg);

    }

    ws.onmessage = (message) => {
        const parsed = JSON.parse(message.data);
        if(parsed.type === "error"){
            alert(parsed.message);
        }
        else if(parsed.type === "system-message") {
            addChatMessage("system-message", parsed.message);
        }
        else if(parsed.type === "chatmessage"){
            addChatMessage(parsed.username, parsed.message);
        }
    }

    const disconnect = () => {
        ws.close(1000, "Disconnected by user");
        setWs(null);
    }

    return (
        <div id="chatpanel" className="container column">
            <h3 className="sectiontitle">Lobby Chat</h3>
            <hr />
            <ul className="chathistory">
                {chatHistory.map((message, i) => 
                    <ChatMessage key={i} name={message.username} message={message.message} />
                )}
            </ul>
            <hr />
            <div className="container messageinput">
                <input type="text" onChange={(e) => setMsg(e.target.value)} />
                <button onClick={() => sendMessage(msg)}>Send</button>
                <button onClick={disconnect}>Disconnect</button>
            </div>
        </div>
    )


}

export default ChatPanel