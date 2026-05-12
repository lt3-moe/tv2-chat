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
  const [videoSource, setVideoSource] = useState<MediaStream | string>(
    idle_video,
  );

  useEffect(() => {
    reader.current = new MediaMTXWebRTCReader({
      url: `${window.location.origin}/webrtc-stream/whep`,
      onError: (err) => {
        console.error(err);
      },
      onTrack: (evt) => {
        setVideoSource(evt.streams[0]);
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
        <Video
          src={typeof videoSource === "string" ? videoSource : undefined}
          autoPlay
          loop
          playsInline
          muted
          ref={(ref) => {
            if (ref && typeof videoSource !== "string") {
              ref.srcObject = videoSource;
            }
          }}
          style={{
            width: "100%",
            aspectRatio: "16/9",
          }}
        />
      </MinimalVideoSkin>
    </Player.Provider>
  );
}
