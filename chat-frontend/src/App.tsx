import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./App.css";
import Chat from "./chat";
import Player from "./player";
import { useCallback, useState } from "react";
import type { AnyWsMessage, UserMessage } from "./ws";
import useWebsocket from "./ws";

export default function App() {
  const [chatState, setChatState] = useState<ReadonlyMap<string, UserMessage>>(
    new Map(),
  );

  const onMessage = useCallback((message: AnyWsMessage) => {
    if (message.kind == "newMessage") {
      setChatState((state) => new Map([...state, [message.id, message]]));
    }
  }, []);

  const ws = useWebsocket(onMessage);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "80%",
          aspectRatio: 16 / 9,
          float: "left",
          marginRight: "10px",
        }}
      >
        <Player />
      </div>
      <div
        style={{
          position: "relative",
          display: "grid",
          height: "97vh",
          width: "auto",
        }}
      >
        <Chat
          messageState={chatState}
          onSend={(text) => ws.current?.send(text)}
        />
      </div>
    </div>
  );
}
