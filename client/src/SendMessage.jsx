import { gql, useMutation } from "@apollo/client";
import { useState } from "react";

const SEND_MESSAGE = gql`
  mutation SendMessage($content: String!, $sender: String!) {
    sendMessage(content: $content, sender: $sender) {
      id
      content
      sender
    }
  }
`;

const SendMessage = () => {
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [content, setContent] = useState("");
  const [sender, setSender] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage({ variables: { content, sender } });
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Your Name"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
      />
      <input
        type="text"
        placeholder="Type a message"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default SendMessage;
