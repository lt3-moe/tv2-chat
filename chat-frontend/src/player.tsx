import type React from "react";
import { useEffect, useRef, useState } from "react";
import { MediaMTXWebRTCReader } from "./reader.js";

import idle_video from "./assets/idle.mp4";

export default function Player(): React.ReactElement {
  const reader = useRef<MediaMTXWebRTCReader>(null);
  const video = useRef<HTMLVideoElement>(null);

  const [controlsEnabled, setControlsEnabled] = useState(false);

  useEffect(() => {
    reader.current = new MediaMTXWebRTCReader({
      url: `${window.location.origin}/webrtc-stream/whep`,
      onError: (err) => {
        console.error(err);
      },
      onTrack: (evt) => {
        if (video.current !== null) {
          video.current.srcObject = evt.streams[0];
          setControlsEnabled(true);
        }
      },
      onDataChannel: (evt) => {
        evt.channel.binaryType = "arraybuffer";
        evt.channel.onmessage = (evt) => {
          console.log("data channel message", evt.data);
        };
      },
    });

    return () => {
      if (reader.current !== null) {
        reader.current.close();
      }
    };
  }, []);

  return (
    <video
      src={idle_video}
      controls={controlsEnabled}
      loop
      className="videoplayer"
      id="myvideo"
      ref={video}
      autoPlay
      playsInline
      muted
    />
  );
}
