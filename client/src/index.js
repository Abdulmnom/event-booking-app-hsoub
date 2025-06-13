import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.rtl.min.css';
// اتخاذ البيانات الموقته في الذاكرة الوسيطة
import { ApolloClient , InMemoryCache, gql , ApolloProvider } from '@apollo/client';
const client = new ApolloClient( {
  uri : 'http://localhost:4000/graphql',
  cache : new InMemoryCache(),
})

client.query({
  query: gql`
    query Events {
      events {
        id
        title
        date
        description
      }
    }
  `
})


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);



