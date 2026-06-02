import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./App.css";
import Chat from "./components/chat";
import PlayerWithOverlay from "./components/player";
import { useCallback, useState } from "react";
import type { AnyWsMessage } from "./ws";
import useWebsocket from "./ws";
import { useStickyState } from "./util";
import { TitleBox } from "./components/titlebox";

import { DarkModeSwitch, ChatOverlaySwitch } from "./components/controls";
import { pruneOldMessages, type ChatMessage } from "./chatMessages";
import { TIME_ON_PAGE_LOAD } from "./globalState";
const _EMPTY_CHAT = new Map();

export default function App() {
  const [chatState, setChatState] = useStickyState<
    ReadonlyMap<string, ChatMessage>
  >({
    defaultValue: new Map(),
    storageKey: "chatHistory",
    serialize: (map) => JSON.stringify([...map.entries()]),
    deserialize: (value) =>
      pruneOldMessages(new Map(JSON.parse(value)), TIME_ON_PAGE_LOAD),
  });

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
          setChatState((state) => {
            const withThisMessage = new Map([...state, [message.id, message]]);
            return pruneOldMessages(withThisMessage, TIME_ON_PAGE_LOAD);
          });
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
