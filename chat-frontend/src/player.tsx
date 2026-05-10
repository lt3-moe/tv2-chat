import type React from "react";
import { useEffect, useRef } from "react";
import { MediaMTXWebRTCReader } from "./reader.js";

export default function Player(): React.ReactElement {
  const reader = useRef<MediaMTXWebRTCReader>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    reader.current = new MediaMTXWebRTCReader({
      url: `${window.location.origin}/webrtc-stream/whep`,
      onError: (err) => {
        console.error(err);
      },
      onTrack: (evt) => {
        if (video.current !== null) {
          video.current.srcObject = evt.streams[0];
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
      ref={video}
      id="myvideo"
      controls
      autoPlay
      playsInline
      muted
      width="100%"
      height="100%"
    ></video>
  );
}
