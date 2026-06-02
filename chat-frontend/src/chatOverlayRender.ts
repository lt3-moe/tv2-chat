import { type ChatMessage, orderByTimestamp } from "./chatMessages";
import { useEffect, useRef } from "react";
import { hashCode } from "./util";

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

const TEXT_FONT_SIZE = 48;
const TEXT_FONT = `${TEXT_FONT_SIZE}px serif`;
const MOVE_PIXEL_FACTOR = 600;

/// should be used only as initial time source
const timeOnPageLoad = Date.now();

export function useChatOverlayRender(chatMessages: ReadonlyMap<string, ChatMessage>, canvasRef: React.RefObject<HTMLCanvasElement | null>): void {
  const animationRef = useRef<number | null>(null);

  const orderedChat = orderByTimestamp(chatMessages);

    useEffect(() => {
      const animate = (relativeTime: number) => {
        const canvas = canvasRef.current;
        if (canvas === null) {
          return;
        }

        const ctx = canvas.getContext("2d");
        if (ctx === null) {
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (orderedChat.length === 0) {
          return;
        }

        ctx.font = TEXT_FONT;
        ctx.fillStyle = "#ff00ff";

        const absoluteRenderTime = timeOnPageLoad + relativeTime;

        for (const message of orderedChat) {
          const x = messagePositionX(message, absoluteRenderTime);
          const y = messagePositionY(message);
          if (x > CANVAS_WIDTH){
            continue;
          }

          ctx.fillText(message.text, x, y);
          console.log("render at", x, y);
        }

        console.log("drawn canvas elements");

        animationRef.current = requestAnimationFrame(animate);
      }

      animationRef.current = requestAnimationFrame(animate);

      return () => {if (animationRef.current) cancelAnimationFrame(animationRef.current);}
  }, [canvasRef, orderedChat]);
}



function messagePositionY(message: ChatMessage): number {
  const hash = Math.abs(hashCode(message.id));

  const factor = hash % 100 / 100;

  return CANVAS_HEIGHT * 0.05 + CANVAS_HEIGHT * (1 - 0.05) * factor;
}

function messagePositionX(message: ChatMessage, currentAbsoluteTime: number): number {
  const base = -approximateTextWidth(message.text);
  const offset = (currentAbsoluteTime - message.timestamp) / 1000 * MOVE_PIXEL_FACTOR;
  return base + offset;
}

function approximateTextWidth(text: string): number {
  return text.length * TEXT_FONT_SIZE;
}
