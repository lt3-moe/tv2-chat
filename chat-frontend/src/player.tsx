import type React from "react";

export default function Player(): React.ReactElement {
  return (
    <iframe
      src="/webrtc-stream/"
      allow="autoplay; encrypted-media;"
      width="100%"
      height="100%"
      scrolling="no"
      allowFullScreen={true}
      sandbox="allow-scripts"
      style={{
        border: "none",
      }}
    ></iframe>
  );
}
