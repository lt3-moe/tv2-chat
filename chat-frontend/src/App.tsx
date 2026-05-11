import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./App.css";
import Chat from "./chat";
import Player from "./player";
import { useCallback, useState } from "react";
import type { AnyWsMessage, UserMessage } from "./ws";
import useWebsocket from "./ws";
import { useStickyState } from "./util";

export default function App() {
  const [chatState, setChatState] = useStickyState<
    ReadonlyMap<string, UserMessage>
  >({
    defaultValue: new Map(),
    storageKey: "chatHistory",
    serialize: (map) => JSON.stringify([...map.entries()]),
    deserialize: (value) => new Map(JSON.parse(value)),
  }); // TODO: limit depth of storage
  console.log(chatState);

  const [viewers, setViewers] = useState<number | undefined>(undefined);

  const onMessage = useCallback(
    (message: AnyWsMessage) => {
      switch (message.kind) {
        case "newMessage": {
          setChatState((state) => new Map([...state, [message.id, message]]));
          break;
        }
        case "viewCount": {
          setViewers(message.count);
        }
      }
    },
    [setChatState],
  );

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
        Current viewers: {viewers !== undefined ? viewers : "???"}
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
