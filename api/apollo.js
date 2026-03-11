// import { withApollo } from 'next-apollo';
// import ApolloClient, { InMemoryCache } from 'apollo-boost';

// const API_URI = `${process.env.NEXT_PUBLIC_SERVER_URL}/graphql`;

// const apolloClient = new ApolloClient( {
//     uri: API_URI,
//     cache: new InMemoryCache()
// } );

// export default withApollo( apolloClient );

import { withApollo } from 'next-apollo';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const API_URI = `${process.env.NEXT_PUBLIC_SERVER_URL}/graphql`;

// Create an HTTP link for Apollo Client
const httpLink = createHttpLink({
  uri: API_URI,
});

// Set up the Apollo Client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default withApollo(apolloClient);
