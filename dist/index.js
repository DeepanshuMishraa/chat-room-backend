"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const httpServer = app.listen(8080, function () {
    console.log("Server Listening on port 8080");
});
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Replace with your actual frontend URL
}));
app.use(express_1.default.json()); // This line is important to parse JSON request bodies
const wss = new ws_1.WebSocketServer({ server: httpServer });
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
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(messageWithName, { binary: isBinary });
                    }
                });
                break;
            default:
                break;
        }
    });
});
