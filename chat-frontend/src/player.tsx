import type React from "react";
import { useEffect, useRef, useState } from "react";
import { MediaMTXWebRTCReader } from "./reader.js";

import idle_video from "./assets/idle.mp4";
import { createPlayer } from "@videojs/react";
import * as videoJS from "@videojs/react";
import { MinimalVideoSkin, Video } from "@videojs/react/video";
import "@videojs/react/video/minimal-skin.css";

const Player = createPlayer({
  features: [
    videoJS.controlsFeature,
    videoJS.playbackFeature,
    videoJS.volumeFeature,
    videoJS.fullscreenFeature,
  ],
});

export default function PlayerWithOverlay(): React.ReactElement {
  const reader = useRef<MediaMTXWebRTCReader>(null);
  const video = useRef<HTMLVideoElement>(null);

  const [controlsEnabled, setControlsEnabled] = useState(false);
  const [idleVideoUsed, setIdleVideoUsed] = useState(true);

  useEffect(() => {
    reader.current = new MediaMTXWebRTCReader({
      url: `${window.location.origin}/webrtc-stream/whep`,
      onError: (err) => {
        console.error(err);
      },
      onTrack: (evt) => {
        if (video.current !== null) {
          video.current.srcObject = evt.streams[0];
          setIdleVideoUsed(false);
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
      <MinimalVideoSkin
        style={{
          color: "transparent",
        }}
      >
        <Video
          src={idleVideoUsed ? idle_video : undefined} // replaced via srcObject during streams
          autoPlay
          loop
          playsInline
          muted
          ref={video}
          style={{
            width: "100%",
            aspectRatio: "16/9",
          }}
        />
      </MinimalVideoSkin>
    </Player.Provider>
  );
}
