import { hashCode } from "./util";

export interface ChatMessage {
  text: string;
  author: string;
  timestamp: number;
  id: string;
}


export function orderByTimestamp(
  messages: ReadonlyMap<string, ChatMessage>,
): ChatMessage[] {
  const result = [...messages.values()];
  result.sort((first, second) => first.timestamp - second.timestamp);
  return result;
}

export function pruneOldMessages(messages: ReadonlyMap<string, ChatMessage>, absoluteTime: number): ReadonlyMap<string, ChatMessage> {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const result = new Map();
  for (const [messageId, message] of messages) {
    if (absoluteTime - message.timestamp > ONE_DAY) {
      continue;
    }
    result.set(messageId, message);
  }
  return result;
}

export function pickMessageColor(name: string): string {
  const nameHash = hashCode(name);
  // experimentally inferred to give lt3_liz purple color
  const angleBase = 270;
  const angle = (angleBase + nameHash) % 360;
  return `hsl(${angle} 30% 70%)`;
}