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
