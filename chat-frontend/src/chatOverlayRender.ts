import { type ChatMessage, orderByTimestamp } from "./chatMessages";
import { useEffect, useRef } from "react";

export function useChatOverlayRender(chatMessages: ReadonlyMap<string, ChatMessage>, canvasRef: React.RefObject<HTMLCanvasElement | null>): void {
  const animationRef = useRef<number | null>(null);

  const orderedChat = orderByTimestamp(chatMessages);

    useEffect(() => {
      const animate = () => {
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

        ctx.font = "48px serif";
        ctx.fillStyle = "#ff00ff";
        ctx.fillText(orderedChat[orderedChat.length - 1].text, 10, 50);
        console.log("drawn canvas elements");

        animationRef.current = requestAnimationFrame(animate);
      }
      animationRef.current = requestAnimationFrame(animate);
      return () => {if (animationRef.current) cancelAnimationFrame(animationRef.current);}
  }, [canvasRef, orderedChat]);
}