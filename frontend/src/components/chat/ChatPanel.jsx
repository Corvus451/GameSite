import { useContext, useEffect, useRef, useState } from "react"
import { SettingsContext } from "../../main";
import ChatMessage from "./ChatMessage";

const ChatPanel = ({ ws, setWs }) => {

    const [lobbyName, setLobbyname] = useState("");
    const [settings, setSettings] = useContext(SettingsContext);
    const [chatHistory, setChatHistory] = useState([]);
    const [msg, setMsg] = useState("");
    const chatRef = useRef(null);
    const [lobbyId, setLobbyId] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(()=> {
        if(chatRef.current){
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const addChatMessage = async (name, message) => {
      setChatHistory(prev => [...prev, { username: name, message: message }]);

    }

    const addchatMessages = async (messages) => {
        console.log("setting chat history from lobbydata");
        setChatHistory(prev => [...prev, ...messages.map(m => ({username: m.username || "system-message", message: m.message}))]);
    }

    const sendMessage = (msg) => {

        const message = {
            type: "chatmessage",
            message: msg
        };

        ws.send(JSON.stringify(message));

        setSending(true);

        // addChatMessage(settings.username, msg);

    }

    // ws.onclose = (close) => {
    //     alert("Disconnected:" + close.reason);
    //     // close chat panel
    // }

    ws.onmessage = (message) => {
        const parsed = JSON.parse(message.data);

        console.log("Message received");

        if (parsed.type === "error") {
            alert(parsed.message);
        }
        else if (parsed.type === "system-message") {
            addChatMessage("system-message", parsed.message);
        }
        else if (parsed.type === "chatmessage") {
            addChatMessage(parsed.username, parsed.message);
            if(sending && parsed.username === settings.username) {
                setSending(false);
            }
        }
        else if(parsed.type === "lobbydata") {
            console.log("lobby data:");
            console.log(parsed.lobby);
            addchatMessages(parsed.lobby.messages);
            setLobbyId(parsed.lobby.lobby_id);
        }
        document.querySelector(".chathistory").scrollTo(0, document.querySelector(".chathistory").scrollHeight);
    }

    const disconnect = () => {
        ws.close(1000, "Disconnected by user");
        setWs(null);
    }

    return (
        <div id="chatpanel" className="column">
            <h3 className="sectiontitle">Lobby Chat</h3>
            <span>{lobbyId}</span>
            <hr />
            <ul className="chathistory container" ref={chatRef}>
                {chatHistory.map((message, i) =>
                    <ChatMessage key={i} name={message.username} message={message.message} />
                )}
            </ul>
            <div className="container messageinput">
                <input type="text" onChange={(e) => setMsg(e.target.value)} />
                <div className="row justify-sb flex">
                    <button onClick={() => sendMessage(msg)}>Send</button>
                    {sending && <span>Sending...</span>}
                </div>
                <button onClick={disconnect}>Disconnect</button>
            </div>
        </div>
    )


}

export default ChatPanel