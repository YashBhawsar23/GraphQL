import { gql, useSubscription } from "@apollo/client";

const MESSAGE_SUBSCRIPTION = gql`
  subscription {
    messageAdded {
      id
      content
      sender
    }
  }
`;

const Messages = () => {
  const { data, loading } = useSubscription(MESSAGE_SUBSCRIPTION);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>New Message</h2>
      <p>
        <strong>{data.messageAdded.sender}:</strong> {data.messageAdded.content}
      </p>
    </div>
  );
};

export default Messages;
