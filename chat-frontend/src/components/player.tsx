import React from "react";
import { useRef, useState, memo } from "react";

import idle_video from "../assets/idle.mp4";
import { createPlayer } from "@videojs/react";
import * as videoJS from "@videojs/react";
import { MinimalVideoSkin, Video } from "@videojs/react/video";
import { HlsVideo } from "@videojs/react/media/hls-video";
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
  | { kind: "stream"; value: string }
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
          {videoSource.kind == "stream" ? (
            <HlsVideo
              src={videoSource.value}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                aspectRatio: "16/9",
              }}
            />
          ) : (
            <Video
              src={videoSource.value}
              autoPlay
              loop
              playsInline
              muted
              style={{
                width: "100%",
                aspectRatio: "16/9",
              }}
            />
          )}

          <Canvas canvasRef={canvasRef} />
        </MinimalVideoSkin>
      </Player.Provider>
    );
  },
);

const hlsURL = "/video-stream/index.m3u8";

export default function PlayerWithOverlayEffects({
  chatMessages,
}: {
  chatMessages: ReadonlyMap<string, ChatMessage>;
}): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoSource, setVideoSource] = useState<VideoSource>({
    kind: "stream",
    value: hlsURL,
  });

  useChatOverlayRender(chatMessages, canvasRef);

  return <WithOverlay videoSource={videoSource} canvasRef={canvasRef} />;
}
