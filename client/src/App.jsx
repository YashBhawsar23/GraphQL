import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import Messages from "./Messages";
import SendMessage from "./SendMessage";

function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h1>GraphQL Subscription Chat</h1>
        <SendMessage />
        <Messages />
      </div>
    </ApolloProvider>
  );
}

export default App;
