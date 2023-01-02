import { ApolloServer, gql } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

import { users, quotes } from './fakedb.js'

const typeDefs = gql`
  type Query{
    users: [User]
  }

  type User {
    id: ID
    firstName: String
    lastName: String
    email: String
    password: String
  }
`

const resolvers = {
  Query: {
    users: () => users
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