import { useEffect } from "react";

const Receiver = () => {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "identified-as-receiver",
        })
      );
    };

    startReceiving(socket);
  }, []);

  function startReceiving(socket: WebSocket) {
    // const video = document.createElement("video");
    // document.body.appendChild(video);
    const pc = new RTCPeerConnection();
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "offer") {
        await pc.setRemoteDescription(message.offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.send(JSON.stringify({ type: "create-answer", answer: answer }));
        pc.onicecandidate = (event) => {
          if (event.candidate)
            socket.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
        };
      } else if (message.type === "iceCandidate") {
        pc.addIceCandidate(message.candidate);
      }
    };
    pc.ontrack = (event) => {
      const video  = document.getElementById("videostream");
      console.log(event.track)
        if (video) 
      video.srcObject = new MediaStream([event.track]);
      
       
}
    };


  return <><video id="videostream" autoPlay ></video> </>;
};

export default Receiver;
