const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

// Defining GraphQL Schema
const schema = buildSchema(`
    type User {
    id: ID!
    name: String!
    email: String!
    }

    type Query {
    getUser(id: ID!): User
    }

    type Mutation {
    createUser (name: String!, email: String!): User
    }

    `);

// Define Resolvers
const users = {};

const root = {
  getUser: ({ id }) => {
    return users[id];
  },

  createUser: ({ name, email }) => {
    const id = Date.now().toString();
    users[id] = { id, name, email };
    return users[id];
  },
};

// GraphQL Middleware
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

// Start Server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
