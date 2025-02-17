const { ApolloServer, gql } = require("apollo-server");
const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();
const MESSAGE_ADDED = "MESSAGE_ADDED";

const typeDefs = gql`
  type Message {
    id: ID!
    content: String!
    sender: String!
  }

  type Query {
    messages: [Message!]
  }

  type Mutation {
    sendMessage(content: String!, sender: String!): Message!
  }

  type Subscription {
    messageAdded: Message!
  }
`;

const messages = [];

const resolvers = {
  Query: {
    messages: () => messages,
  },
  Mutation: {
    sendMessage: (_, { content, sender }) => {
      const message = { id: Date.now().toString(), content, sender };
      messages.push(message);
      pubsub.publish(MESSAGE_ADDED, { messageAdded: message });
      return message;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator([MESSAGE_ADDED]),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  Subscriptions: {
    path: "/subscriptions",
  },
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`);
  console.log(`Subscriptions ready at ${subscriptionsUrl}`);
});
