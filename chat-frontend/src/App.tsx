import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./App.css";
import Chat from "./chat";
import Player from "./player";
import { useCallback, useState } from "react";
import type { AnyWsMessage, UserMessage } from "./ws";
import useWebsocket from "./ws";
import { useStickyState } from "./util";

function DarkMode() {
  const [isDarkMode, setDarkMode] = useState(0);
  function click() {
    setDarkMode(isDarkMode == 1 ? 0 : 1);
    if(isDarkMode){
      document.body.classList.add("dark");
    }else{
      document.body.classList.remove("dark");

    }
  }
  return (
    <button onClick={click}>
      Switch to {isDarkMode == 1 ? "light" : "dark "} mode
    </button>
  );
}

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
  const logo = "/image.png";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="mainTitle">
          <img className="logo" src={logo} alt="Меньше чем три"></img>
          <h1 className="titleText">PARASOCIAL CINEMA</h1>
        </div>
      </div>
      <div className="PlayerBox">
        <div className="videoPlayerDiv">
          <Player />
          <div style={{ display: "flex", }}>
            <div className="streamTitle">
              <p>title</p>
            </div>
            <div className="viewerCount">
              <p>Current viewers: {viewers !== undefined ? viewers : "???"}</p>
            </div>
          </div>
          <DarkMode />
        </div>


        <div className="mainChat">
          <Chat
            messageState={chatState}
            onSend={(text) => ws.current?.send(text)}
          />

        </div>
      </div>


    </div>
  );
}
