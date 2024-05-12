import { WebSocket, WebSocketServer } from "ws";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({ port: 8080 });

let SenderSocket: null | WebSocket = null;
let ReceiverSocket: null | WebSocket = null;

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", (data: any) => {
    const message = JSON.parse(data);

    if (message.type === "identified-as-sender") {
      console.log("sender set");
      SenderSocket = ws;
    } else if (message.type === "identified-as-receiver") {
      console.log("receiver set");
      ReceiverSocket = ws;
    } else if (message.type === "create-offer") {
      ReceiverSocket!.send(
        JSON.stringify({ type: "offer", offer: message.offer })
      );
    } else if (message.type === "create-answer") {
      SenderSocket!.send(
        JSON.stringify({ type: "answer", answer: message.answer })
      );
    } else if (message.type === "iceCandidate") {
      if (ws == SenderSocket) {
        ReceiverSocket!.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: message.iceCandidate,
          })
        );
      }
      if (ws == ReceiverSocket) {
        SenderSocket!.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: message.iceCandidate,
          })
        );
      }
    }
  });
});
