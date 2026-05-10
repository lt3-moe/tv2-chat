import type React from "react";
import { useEffect, useRef } from "react";

export interface UserMessage {
  kind: "newMessage";
  text: string;
  author: string;
  timestamp: number;
  id: string;
}

export interface ViewCount {
  kind: "viewCount";
  count: number;
}

export type AnyWsMessage = UserMessage | ViewCount;

function getWsUrl(): string {
  return `${location.protocol == "http:" ? "ws" : "wss"}://${location.host}/ws`;
}


/**
* Connect to websocket and run callback on each update
*
* Note: callback must be wrapped in useCallback on caller side
*/
export default function useWebsocket(onWsMessage: (e: AnyWsMessage) => void): React.RefObject<WebSocket | null> {
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
    const socket = new WebSocket(getWsUrl());
    ws.current = socket;


    socket.addEventListener("message", (ev) => {
        const message: AnyWsMessage = JSON.parse(ev.data);
        onWsMessage(message)
    });

    return () => {
      socket.close();
    };
  }, [onWsMessage]);

    return ws;
}