// server/services/wsService.js
const { WebSocketServer } = require('ws');

let wss = null;
const clients = new Set();

function initWebSocketServer(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message);
        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (err) {
        // ignore non-json ping
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });

    // Send connected acknowledgement
    ws.send(JSON.stringify({ type: 'connected', message: 'BookLeaf Live Sync Active' }));
  });

  return wss;
}

function broadcastEvent(eventType, payload) {
  if (!wss) return;
  const data = JSON.stringify({
    type: eventType,
    payload,
    timestamp: new Date().toISOString()
  });

  for (const client of clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(data);
    }
  }
}

module.exports = {
  initWebSocketServer,
  broadcastEvent
};
