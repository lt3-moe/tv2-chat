import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./App.css";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import { useState } from "react";

interface Message {
  text: string;
  sender: string;
}

interface MessageMerged extends Message {
  showSender: boolean;
}

function mergeSenders(messages: Message[]): MessageMerged[] {
  if (messages.length === 0) {
    return [];
  }

  const result = [{ ...messages[0], showSender: true }];
  let previousMessage = messages[0];
  for (const message of messages.slice(1)) {
    if (message.sender == previousMessage.sender) {
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

const Chat = ({
  messages,
  onSend,
}: {
  messages: Message[];
  onSend: (text: string) => void;
}) => {
  return (
    <div style={{ position: "relative", height: "500px" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {mergeSenders(messages).map((message, idx) => (
              <Message
                key={`message-${idx}`}
                type="text"
                model={{
                  message: message.text,
                  direction: "outgoing",
                  position: "last",
                }}
                className="custom-color-message"
                // @ts-expect-error style is defined is custom css based on var
                style={{ "--bubble-color": pickMessageColor(message.sender) }}
              >
                <Message.Header>
                  {message.showSender ? message.sender : null}
                </Message.Header>
                <Message.TextContent>{message.text}</Message.TextContent>
              </Message>
            ))}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            attachButton={false}
            onSend={onSend}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<Message[]>([]);
  return (
    <Chat
      messages={state}
      onSend={(text) => setState([...state, { text: text, sender: "lt3_liz" }])}
    />
  );
}
