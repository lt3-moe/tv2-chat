import React, { useEffect } from "react";
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

type VideoSource = "stream" | "idle";

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
      features: videoSource === "stream" ? playerFeatures : [],
    });

    return (
      <Player.Provider>
        <MinimalVideoSkin>
          {videoSource == "stream" ? (
            <HlsVideo
              src={hlsURL}
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
              src={idle_video}
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
  const [videoSource, setVideoSource] = useState<VideoSource>("idle");

  useWatchVideo(setVideoSource);

  useChatOverlayRender(chatMessages, canvasRef);

  return <WithOverlay videoSource={videoSource} canvasRef={canvasRef} />;
}

const useWatchVideo = (setVideoSource: (arg0: VideoSource) => void) => {
  const checkRef = useRef(0);

  useEffect(() => {
    async function checkVideoAvailable() {
      try {
        const response = await fetch(hlsURL, {
          signal: AbortSignal.timeout(5000),
        });
        switch (response.status) {
          case 200:
            console.log("available");
            setVideoSource("stream");
            break;
          case 404:
            console.log("not available");
            setVideoSource("idle");
            break;
          default:
            console.error("unexpected status code when checking video stream");
            setVideoSource("idle");
        }
      } catch (error) {
        console.log(error);
        setVideoSource("idle");
      }
    }

    checkRef.current = setInterval(checkVideoAvailable, 5000);
    return () => {
      if (checkRef.current) {
        clearTimeout(checkRef.current);
      }
    };
  }, [setVideoSource]);
};
