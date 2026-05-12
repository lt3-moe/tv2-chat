import type React from "react";
import { useEffect, useRef, useState } from "react";
import { MediaMTXWebRTCReader } from "./reader.js";

import idle_video from "./assets/idle.mp4";
import { createPlayer, videoFeatures } from "@videojs/react";
import { MinimalVideoSkin, Video } from "@videojs/react/video";
import "@videojs/react/video/minimal-skin.css";

const Player = createPlayer({ features: videoFeatures });

export default function PlayerWithOverlay(): React.ReactElement {
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
    <Player.Provider>
      <MinimalVideoSkin>
        <Video src={idle_video} autoPlay loop playsInline muted />
      </MinimalVideoSkin>
    </Player.Provider>
  );
}
