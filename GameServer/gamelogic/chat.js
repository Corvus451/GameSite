exports.broadcastMessage = (clientList, sender, message) => {
    clientList.forEach(client => {
        if(client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}