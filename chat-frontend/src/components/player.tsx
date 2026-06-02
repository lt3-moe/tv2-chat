import React from "react";
import { useEffect, useRef, useState, memo } from "react";
import { MediaMTXWebRTCReader } from "../reader.js";

import idle_video from "../assets/idle.mp4";
import { createPlayer } from "@videojs/react";
import * as videoJS from "@videojs/react";
import { MinimalVideoSkin, Video } from "@videojs/react/video";
import "@videojs/react/video/minimal-skin.css";
import { type ChatMessage } from "../chatMessages";
import {
  useChatOverlayRender,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
} from "../chatOverlayRender";

const playerFeatures = [
  videoJS.controlsFeature,
  videoJS.playbackFeature,
  videoJS.volumeFeature,
  videoJS.fullscreenFeature,
];

type VideoSource =
  | { kind: "stream"; value: MediaStream }
  | { kind: "idle"; value: string };

const Canvas = ({
  canvasRef,
}: {
  canvasRef?: React.Ref<HTMLCanvasElement>;
}) => {
  return (
    <canvas
      ref={canvasRef}
      style={{
        zIndex: 12147483647,
        position: "absolute",
        width: "100%",
        height: "100%",
        inset: 0,
        pointerEvents: "none",
      }}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
    />
  );
};

const WithOverlay = memo(
  ({
    videoSource,
    canvasRef,
  }: {
    videoSource: VideoSource;
    canvasRef: React.Ref<HTMLCanvasElement>;
  }) => {
    const Player = createPlayer({
      features: videoSource.kind === "stream" ? playerFeatures : [],
    });

    return (
      <Player.Provider>
        <MinimalVideoSkin>
          <Video
            src={videoSource.kind === "idle" ? videoSource.value : undefined}
            autoPlay
            loop
            playsInline
            muted
            ref={(ref) => {
              if (ref && videoSource.kind === "stream") {
                ref.srcObject = videoSource.value;
              }
            }}
            style={{
              width: "100%",
              aspectRatio: "16/9",
            }}
          />
          <Canvas canvasRef={canvasRef} />
        </MinimalVideoSkin>
      </Player.Provider>
    );
  },
);

export default function PlayerWithOverlayEffects({
  chatMessages,
}: {
  chatMessages: ReadonlyMap<string, ChatMessage>;
}): React.ReactElement {
  const reader = useRef<MediaMTXWebRTCReader>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoSource, setVideoSource] = useState<VideoSource>({
    kind: "idle",
    value: idle_video,
  });

  useEffect(() => {
    reader.current = new MediaMTXWebRTCReader({
      url: `${window.location.origin}/webrtc-stream/whep`,
      onError: (err) => {
        console.error(err);
      },
      onTrack: (evt) => {
        setVideoSource({ kind: "stream", value: evt.streams[0] });
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

  useChatOverlayRender(chatMessages, canvasRef);

  return <WithOverlay videoSource={videoSource} canvasRef={canvasRef} />;
}
