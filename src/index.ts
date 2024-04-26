import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";

const app = express();
const httpServer = app.listen(8080, function () {
  console.log("Server Listening on port 8080");
});

app.use(cors({ origin: "*" }));

app.use(express.json()); // This line is important to parse JSON request bodies

const wss = new WebSocketServer({ server: httpServer });

// Add this route handler for POST /
app.post("/", (req, res) => {
  const reqBody = req.body;
  const name = reqBody.name;
  res.send({ name }); // Send the name back to the client
});

const clients = new Map();

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data, isBinary) {
    const { type, name, message } = JSON.parse(data.toString());

    switch (type) {
      case "setName":
        clients.set(ws, name);
        break;
      case "message":
        const messageWithName = `${name}: ${message}`;
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(messageWithName, { binary: isBinary });
          }
        });
        break;
      default:
        break;
    }
  });
});
