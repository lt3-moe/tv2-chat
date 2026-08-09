import { type ChatMessage, orderByTimestamp, pickMessageColor } from "./chatMessages";
import { useEffect, useRef } from "react";
import { hashCode } from "./util";
import { TIME_ON_PAGE_LOAD } from "./globalState";

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

const TEXT_FONT_SIZE = 48;
const TEXT_FONT = `${TEXT_FONT_SIZE}px serif`;


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

        const absoluteRenderTime = TIME_ON_PAGE_LOAD + relativeTime;

        for (const message of orderedChat) {
          const textMetrics = ctx.measureText(message.text);

          const x = messagePositionX(message, absoluteRenderTime, textMetrics.width);
          const y = messagePositionY(message);
          if (x > CANVAS_WIDTH){
            continue;
          }

          ctx.strokeStyle = "black";
          ctx.lineWidth = 3;
          ctx.strokeText(message.text, x, y);

          ctx.fillStyle = pickMessageColor(message.authorId);
          ctx.fillText(message.text, x, y);
        }

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

function messagePositionX(message: ChatMessage, currentAbsoluteTime: number, width: number): number {
  const base = CANVAS_WIDTH;
  const delayFactor = 1000;
  const offset = (currentAbsoluteTime - message.timestamp - delayFactor) / 1000 * textFlowSpeed(width);
  return base - offset;
}

function textFlowSpeed(width: number): number {
  const onScreenTime = 5;
  const slowestSpeed = CANVAS_WIDTH / onScreenTime;

  const distanceTravelled = CANVAS_WIDTH + width;
  const computedSpeed = slowestSpeed * distanceTravelled / CANVAS_WIDTH;

  return computedSpeed;
}