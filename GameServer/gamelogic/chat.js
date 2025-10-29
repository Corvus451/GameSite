// Broadcast message to clients connected to this server
exports.broadcastMessage = (clientList, sender, message) => {
    clientList.forEach(client => {
        if(client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}