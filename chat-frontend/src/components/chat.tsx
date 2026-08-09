import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "../App.css";

import { pickMessageColor } from "../chatMessages";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import { type ChatMessage, orderByTimestamp } from "../chatMessages";

interface MessageMerged extends ChatMessage {
  showSender: boolean;
}

function mergeSenders(messages: ChatMessage[]): MessageMerged[] {
  if (messages.length === 0) {
    return [];
  }

  const result = [{ ...messages[0], showSender: true }];
  let previousMessage = messages[0];
  for (const message of messages.slice(1)) {
    if (message.authorId == previousMessage.authorId) {
      result.push({
        ...message,
        showSender: false,
      });
    } else {
      result.push({
        ...message,
        showSender: true,
      });
    }
    previousMessage = message;
  }
  return result;
}

const ChatUI = ({
  messages,
  onSend,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}) => {
  return (
    <MainContainer>
      <ChatContainer>
        <MessageList>
          {mergeSenders(messages).map((message, idx) => {
            const messageColor = pickMessageColor(message.authorId);
            return (
              <Message
                key={`message-${idx}`}
                type="text"
                model={{
                  message: message.text,
                  direction: "outgoing",
                  position: "last",
                }}
                className="custom-color-message"
                // @ts-expect-error style is defined as custom css based on var
                style={{ "--bubble-color": messageColor }}
              >
                <Message.Header>
                  {message.showSender ? message.authorName : null}
                </Message.Header>
                <Message.TextContent>{message.text}</Message.TextContent>
              </Message>
            );
          })}
        </MessageList>
        <MessageInput
          attachButton={false}
          onSend={(_innerHtml, textContent) => onSend(textContent)}
        />
      </ChatContainer>
    </MainContainer>
  );
};

export default function Chat({
  messageState,
  onSend,
}: {
  messageState: ReadonlyMap<string, ChatMessage>;
  onSend: (arg0: string) => void;
}) {
  return <ChatUI messages={orderByTimestamp(messageState)} onSend={onSend} />;
}
