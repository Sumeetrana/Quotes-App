import { ApolloServer, gql } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { randomBytes } from 'crypto';

import { users, quotes } from './fakedb.js'

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