import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.rtl.min.css';
// اتخاذ البيانات الموقته في الذاكرة الوسيطة
import { ApolloClient , InMemoryCache, gql , ApolloProvider , createHttpLink , split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';


const wsLink = new GraphQLWsLink({
  
    url: 'ws://localhost:4000/graphql',
    // اضهار الاشعرات للمستخدمين المسجلين
    connectionParams: {
      authToken: localStorage.getItem('token'),
    },
  
})
const authLink = setContext((_, { headers }) => {
  // إضافة توكن المصادقة إلى رؤوس الطلبات
  const token = localStorage.getItem('token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `jwt ${token}` : '',
    },
  };
}
);


const httpLink = new createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'same-origin', // إذا كنت تستخدم المصادقة
});

const splitLink  = split(
  ({ query}) => {
    const definition = query.definitions[0];
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink)
)



const client = new ApolloClient( {
  link: splitLink,
  cache : new InMemoryCache()

  
  
})


client.query({
  query: gql`
    query Events {
      events {
        _id
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



