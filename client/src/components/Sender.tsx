import { useEffect, useState } from "react";

const Sender = () => {
  const [Socket, setSocket] = useState<null | WebSocket>(null);
  const [Pc, setPc] = useState<null | RTCPeerConnection>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setSocket(socket);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "identified-as-sender",
        })
      );
    };
  }, []);

  const initiateConnection = async () => {
    if (!Socket) {
      alert("Socket connection not established yet.");
      return;
    }

    const pc = new RTCPeerConnection();
    setPc(pc);

    pc.onnegotiationneeded = async () => {
      console.log("onnegotiationneeded.");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      Socket.send(JSON.stringify({ type: "create-offer", offer: offer }));
    };

    pc.onicecandidate = (event) => {
      console.log(event);
      if (event.candidate) {
        Socket.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

    Socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type == "answer") {
        await pc.setRemoteDescription(message.answer);
      } else if (message.type == "iceCandidate") {
         pc.addIceCandidate(message.candidate);
      }
    };

    getCameraStreamAndSend(pc);
  };

  const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        // this is wrong, should propogate via a component
        document.body.appendChild(video);
        stream.getTracks().forEach((track) => {
            pc?.addTrack(track);
        });
    });
    };
  
  return (
    <>
      <div>Hello Friends</div>
      <button onClick={initiateConnection}>Send Video </button>
    </>
  );
};

export default Sender;
