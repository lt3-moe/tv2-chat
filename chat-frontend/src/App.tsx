import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./App.css";
import Chat from "./components/chat";
import PlayerWithOverlay from "./components/player";
import { useCallback, useState } from "react";
import type { AnyWsMessage, UserMessage } from "./ws";
import useWebsocket from "./ws";
import { useStickyState } from "./util";

import dark_icon from "./assets/dark_mode_icon.svg";
import light_icon from "./assets/light_mode_icon.svg";
import lt3_logo from "./assets/image.png";
import chatPlayIcon from "./assets/chat_play_icon.svg";
import { ReactSVG } from "react-svg";

function DarkModeSwitch({
  isDark,
  onClick,
}: {
  isDark: boolean;
  onClick: () => void;
}) {
  return (
    <ReactSVG
      src={isDark ? light_icon : dark_icon}
      width="48px"
      height="auto"
      title="Dark mode toggle"
      onClick={onClick}
      className="noselect"
    />
  );
}

function ChatOverlaySwitch({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <ReactSVG
      src={chatPlayIcon}
      title="Chat overlay toggle"
      onClick={onClick}
      style={{
        opacity: enabled ? 1 : 0.4,
        height: "48px",
      }}
      className="noselect"
    />
  );
}

function TitleBox(): React.ReactElement {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div className="mainTitle">
        <img className="logo" src={lt3_logo} alt="Меньше чем три"></img>
        <h1 className="titleText">PARASOCIAL CINEMA</h1>
      </div>
    </div>
  );
}

const _EMPTY_CHAT = new Map();

export default function App() {
  const [chatState, setChatState] = useStickyState<
    ReadonlyMap<string, UserMessage>
  >({
    defaultValue: new Map(),
    storageKey: "chatHistory",
    serialize: (map) => JSON.stringify([...map.entries()]),
    deserialize: (value) => new Map(JSON.parse(value)),
  }); // TODO: limit depth of storage

  const [isDarkMode, setDarkMode] = useStickyState({
    defaultValue: false,
    storageKey: "isDarkModeEnabled",
  });

  const [isChatOverlayEnabled, setChatOverlayEnabled] = useStickyState({
    defaultValue: false,
    storageKey: "isChatOverlayEnabled",
  });

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
      className={isDarkMode ? "dark-theme-colors" : "light-theme-colors"}
    >
      <TitleBox />
      <div className="PlayerBox">
        <div className="videoPlayerDiv">
          <PlayerWithOverlay
            chatMessages={isChatOverlayEnabled ? chatState : _EMPTY_CHAT}
          />
          <div style={{ display: "flex" }}>
            <div className="streamTitle">
              <p>title</p>
            </div>
            <div className="viewerCount">
              <p>Current viewers: {viewers !== undefined ? viewers : "???"}</p>
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <DarkModeSwitch
              isDark={isDarkMode}
              onClick={() => setDarkMode(!isDarkMode)}
            />
            <ChatOverlaySwitch
              enabled={isChatOverlayEnabled}
              onClick={() => setChatOverlayEnabled(!isChatOverlayEnabled)}
            />
          </div>
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
