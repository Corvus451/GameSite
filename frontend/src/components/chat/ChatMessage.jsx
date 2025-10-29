const ChatMessage = ({ name, message }) => {

    return (
        <div className="chatmessage"><b>{name}</b>: {message}</div>
    )
}

export default ChatMessage;