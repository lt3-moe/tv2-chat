import "./App.css";

import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

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
  sender?: string;
}

function mergeSenders(messages: Message[]): Message[] {
  if (messages.length === 0) {
    return messages;
  }

  const result = [messages[0]];
  for (const message of messages.slice(1)) {
    if (message.sender == result[result.length - 1].sender) {
      result.push({
        text: message.text,
      });
    } else {
      result.push(message);
    }
  }
  return result;
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
            {mergeSenders(messages).map((message) => (
              <Message
                type="text"
                model={{
                  message: message.text,
                  direction: "outgoing",
                  position: "last",
                }}
              >
                <Message.Header>{message.sender}</Message.Header>
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
