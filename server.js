import { ApolloServer, gql } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

import { users, quotes } from './fakedb.js'

const typeDefs = gql`
  type Query{
    users: [User]
    quotes: [Quote]
  }

  type User {
    id: ID!
    firstName: String
    lastName: String
    email: String
    password: String
  }

  type Quote {
    name: String
    by: String
  }
  
`

const resolvers = {
  Query: {
    users: () => users,
    quotes: () => quotes
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