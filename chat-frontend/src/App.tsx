import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./App.css";
import Chat from "./chat";
import Player from "./player";

export default function App() {
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
      <div>
        <Chat />
      </div>
    </div>
  );
}
