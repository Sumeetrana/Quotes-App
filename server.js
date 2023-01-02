import { ApolloServer, gql } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { randomBytes } from 'crypto';
import mongoose from "mongoose";

import './models/User.js';
import './models/Quote.js';
import { users, quotes } from './fakedb.js';
import { MONGO_URL } from './config.js';

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
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
    user(id: ID!): User
    quotes: [Quote]
    iquote(by: ID!): [Quote]
  }

  type User {
    id: ID!
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
  
  type Mutation {
    signupUserDummy(newUser: UserInput!): User
  }

  input UserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }
`

const resolvers = {
  Query: {
    users: () => users,
    user: (parent, args) => users.find(user => user.id === args.id), // parent will undefined here, because it is on root level
    quotes: () => quotes,
    iquote: (_, { by }) => quotes.filter(quote => quote.by === by)
  },
  User: {
    quotes: (user) => quotes.filter(quote => quote.by === user.id) // here, 'user' is parent
  },
  Mutation: {
    signupUserDummy: (_, { newUser }) => {
      const id = randomBytes(5).toString('hex');
      users.push({
        id,
        ...newUser
      })
      return users.find(user => user.id === id);
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