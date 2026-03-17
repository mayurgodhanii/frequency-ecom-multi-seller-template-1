import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import React from 'react';

const API_URI = `${process.env.NEXT_PUBLIC_SERVER_URL}/graphql`;

// Create an HTTP link for Apollo Client
const httpLink = createHttpLink({
  uri: API_URI,
});

// Create Apollo Client instance
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  ssrMode: typeof window === 'undefined',
});

// Create a withApollo HOC for backward compatibility
export const withApollo = (options = {}) => (Component) => {
  const WithApolloComponent = (props) => {
    return (
      <ApolloProvider client={apolloClient}>
        <Component {...props} />
      </ApolloProvider>
    );
  };

  WithApolloComponent.displayName = `withApollo(${Component.displayName || Component.name})`;
  
  // Copy static methods
  if (Component.getInitialProps) {
    WithApolloComponent.getInitialProps = Component.getInitialProps;
  }
  
  return WithApolloComponent;
};

export default withApollo;
