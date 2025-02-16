const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

// Defining GraphQL Schema
const schema = buildSchema(`
    type Query {
    hello: String
    }
    `);

// Define Resolvers
const root = {
  hello: () => {
    return "Hello, GraphQL";
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
