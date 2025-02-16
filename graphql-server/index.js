require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Connection Error", err));

// Defining Schema
const typeDefs = `
type User {
id: ID!
name: String!
email: String!
}

type AuthPayload {
token: String!
user: User!
}

type Query {
getUser(id: ID!): User
}

type Mutation {
createUser(name: String!, email: String!): User
}
`;

// Define Resolvers
const resolvers = {
  Query: {
    getUser: async (_, { id }, context) => {
      if (!context.user) throw new Error("Unauthorized");
      return await User.findById(id);
    },
  },
  Mutation: {
    signup: async (_, { name, email, password }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("User already exists");

      const newUser = new User({ name, email, password });
      await newUser.save();

      const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return { token, user: newUser };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not Found");

      const isMatch = await bycrypt.comapre(password, user.password);
      if (!isMatch) throw new Error("Invalid credentials");

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return { token, user };
    },
  },
};

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });

// Start Server
async function startServer() {
  await server.start();
  app.use(cors());
  app.use(bodyParser.json());
  app.use("/graphql", expressMiddleware(server));

  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}

startServer();
