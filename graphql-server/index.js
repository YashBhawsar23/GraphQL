// require("dotenv").config();
// const express = require("express");
// const { ApolloServer } = require("@apollo/server");
// const { expressMiddleware } = require("@apollo/server/express4");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const User = require("./models/User");

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.log("Connection Error", err));

// // Defining Schema
// const typeDefs = `
// type User {
// id: ID!
// name: String!
// email: String!
// }

// type AuthPayload {
// token: String!
// user: User!
// }

// type Query {
// getUser(id: ID!): User
// }

// type Mutation {
// signup(name: String!, email: String!, password: String!): AuthPayload
// login(email: String!, password: String!): AuthPayload
// }
// `;

// // Define Resolvers
// const resolvers = {
//   Query: {
//     getUser: async (_, { id }, context) => {
//       if (!context.user) throw new Error("Unauthorized");
//       return await User.findById(id);
//     },
//   },
//   Mutation: {
//     signup: async (_, { name, email, password }) => {
//       const existingUser = await User.findOne({ email });
//       if (existingUser) throw new Error("User already exists");

//       const newUser = new User({ name, email, password });
//       await newUser.save();

//       const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
//         expiresIn: "1h",
//       });
//       return { token, user: newUser };
//     },
//     login: async (_, { email, password }) => {
//       const user = await User.findOne({ email });
//       if (!user) throw new Error("User not Found");

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) throw new Error("Invalid credentials");

//       const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
//         expiresIn: "1h",
//       });
//       return { token, user };
//     },
//   },
// };

// const app = express();
// const server = new ApolloServer({ typeDefs, resolvers });

// // Middleware to extract user from token
// const authMiddleware = (req) => {
//   const authHeader = req.headers.authorization;
//   if (authHeader) {
//     const token = authHeader.split(" ")[1];
//     try {
//       return jwt.verify(token, process.env.JWT_SECRET);
//     } catch (error) {
//       throw new Error("Invalid Token");
//     }
//   }
//   return null;
// };

// // Start Server
// async function startServer() {
//   await server.start();

//   app.use(cors());
//   app.use(bodyParser.json());
//   app.use(
//     "/graphql",
//     expressMiddleware(server, {
//       context: async ({ req }) => {
//         const user = authMiddleware(req);
//         return { user };
//       },
//     })
//   );

//   app.listen(3000, () => {
//     console.log("Server running on port 3000");
//   });
// }

// startServer();

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
const { checkAuth, checkAdmin } = require("./utils/auth");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection Error:", err));

// GraphQL Schema
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
  signup(name: String!, email: String!, password: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
}

type Mutation {
deleteUser(id: ID!): String
}

`;

// Resolvers
const resolvers = {
  Query: {
    getUser: async (_, { id }, context) => {
      checkAuth(context);
      // if (!context.user) throw new Error("Unauthorized");
      return await User.findById(id);
    },
  },
  Mutation: {
    deleteUser: async (_, { id }, context) => {
      checkAdmin(context);
      await User.findByIdAndDelete(id);
      return "User Deleted Successfully";
    },

    signup: async (_, { name, email, password }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("User already exists");

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();

      const token = jwt.sign(
        { userId: newUser.id, role: newUser.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      return { token, user: newUser };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      const isMatch = await bcrypt.compare(password, user.password);
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

// Middleware to extract user from token
const authMiddleware = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Authentication Error:", error.message);
      return null; // Instead of throwing an error, return null
    }
  }
  return null;
};

// Start Server
async function startServer() {
  await server.start();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const user = authMiddleware(req);
        return { user };
      },
    })
  );

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
