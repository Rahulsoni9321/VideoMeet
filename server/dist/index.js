"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const wss = new ws_1.WebSocketServer({ port: 8080 });
let SenderSocket = null;
let ReceiverSocket = null;
wss.on("connection", function connection(ws) {
    ws.on("error", console.error);
    ws.on("message", (data) => {
        const message = JSON.parse(data);
        if (message.type === "identified-as-sender") {
            console.log("sender set");
            SenderSocket = ws;
        }
        else if (message.type === "identified-as-receiver") {
            console.log("receiver set");
            ReceiverSocket = ws;
        }
        else if (message.type === "create-offer") {
            ReceiverSocket.send(JSON.stringify({ type: "offer", offer: message.offer }));
        }
        else if (message.type === "create-answer") {
            SenderSocket.send(JSON.stringify({ type: "answer", answer: message.answer }));
        }
        else if (message.type === "iceCandidate") {
            if (ws == SenderSocket) {
                ReceiverSocket.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: message.iceCandidate,
                }));
            }
            if (ws == ReceiverSocket) {
                SenderSocket.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: message.iceCandidate,
                }));
            }
        }
    });
});
