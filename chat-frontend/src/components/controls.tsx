import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "../App.css";

import dark_icon from "../assets/dark_mode_icon.svg";
import light_icon from "../assets/light_mode_icon.svg";
import chatPlayIcon from "../assets/chat_play_icon.svg";
import { ReactSVG } from "react-svg";
import { memo } from "react";

export const DarkModeSwitch = memo(
  ({ isDark, onClick }: { isDark: boolean; onClick: () => void }) => {
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
  },
);

export const ChatOverlaySwitch = memo(
  ({ enabled, onClick }: { enabled: boolean; onClick: () => void }) => {
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
  },
);
