require("dotenv").config();
const User = require("./models/User");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Connection Error", err));

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
  getUser: async ({ id }) => {
    return await User.findById(id);
  },

  createUser: async ({ name, email }) => {
    const newUser = new User({ name, email });
    await newUser.save();
    return newUser;
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
