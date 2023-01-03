import { ApolloServer, gql } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from './models/User.js';
import Quote from './models/Quote.js';
import { users, quotes } from './fakedb.js';
import { JWT_SECRET, MONGO_URL } from './config.js';

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.connection.on("connected", () => {
  console.log("DB connected successfully");
})


mongoose.connection.on("error", (err) => {
  console.log("error connecting DB: ", err);
})

const typeDefs = gql`
  type Query{
    users: [User]
    user(_id: ID!): User
    quotes: [Quote]
    iquote(by: ID!): [Quote]
  }

  type User {
    _id: ID!
    firstName: String
    lastName: String
    email: String
    password: String
    quotes: [Quote]
  }

  type Quote {
    name: String
    by: String
  }
  
  type Token {
    token: String
  }

  type Mutation {
    signupUser(newUser: UserInput!): User
    signinUser(userDetails: UserSigninInput!): Token
  }

  input UserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  input UserSigninInput {
    email: String!
    password: String!
  }
`

const resolvers = {
  Query: {
    users: () => users,
    user: (parent, args) => users.find(user => user._id === args._id), // parent will undefined here, because it is on root level
    quotes: () => quotes,
    iquote: (_, { by }) => quotes.filter(quote => quote.by === by)
  },
  User: {
    quotes: (user) => quotes.filter(quote => quote.by === user._id) // here, 'user' is parent
  },
  Mutation: {
    signupUser: async (_, { newUser }) => {
      const user = await User.findOne({ email: newUser.email })
      if (user) {
        throw new Error("User already exists");
      } else {
        const hashedPassword = await bcrypt.hash(newUser.password, 10);
        const newCreatedUser = new User({
          ...newUser,
          password: hashedPassword
        })

        return await newCreatedUser.save();
      }
    },
    signinUser: async (_, { userDetails }) => {
      const user = await User.findOne({ email: userDetails.email })
      if (!user) {
        throw new Error("User doesn't exist")
      } else {
        const doMatch = await bcrypt.compare(userDetails.password, user.password);
        if (!doMatch) {
          throw new Error("email or password is invalid")
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        console.log("Token: ", token);
        return { token };
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground
  ]
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
})