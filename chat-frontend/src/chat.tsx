import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./App.css";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import { type UserMessage } from "./ws";

interface MessageMerged extends UserMessage {
  showSender: boolean;
}

function mergeSenders(messages: UserMessage[]): MessageMerged[] {
  if (messages.length === 0) {
    return [];
  }

  const result = [{ ...messages[0], showSender: true }];
  let previousMessage = messages[0];
  for (const message of messages.slice(1)) {
    if (message.author == previousMessage.author) {
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

const hashCode = function (s: string) {
  return s.split("").reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
};

function pickMessageColor(name: string): string {
  const nameHash = hashCode(name);
  // experimentally inferred to give lt3_liz purple color
  const angleBase = 270;
  const angle = (angleBase + nameHash) % 360;
  return `hsl(${angle} 30% 70%)`;
}

const ChatUI = ({
  messages,
  onSend,
}: {
  messages: UserMessage[];
  onSend: (text: string) => void;
}) => {
  return (
    <MainContainer>
      <ChatContainer>
        <MessageList>
          {mergeSenders(messages).map((message, idx) => {
            const messageColor = pickMessageColor(message.author);
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
                  {message.showSender ? message.author : null}
                </Message.Header>
                <Message.TextContent>{message.text}</Message.TextContent>
              </Message>
            );
          })}
        </MessageList>
        <MessageInput
          placeholder="Type message here"
          attachButton={false}
          onSend={onSend}
        />
      </ChatContainer>
    </MainContainer>
  );
};

function orderByTimestamp(
  messages: ReadonlyMap<string, UserMessage>,
): UserMessage[] {
  const result = [...messages.values()];
  result.sort((first, second) => first.timestamp - second.timestamp);
  return result;
}

export default function Chat({
  messageState,
  onSend,
}: {
  messageState: ReadonlyMap<string, UserMessage>;
  onSend: (arg0: string) => void;
}) {
  return <ChatUI messages={orderByTimestamp(messageState)} onSend={onSend} />;
}
