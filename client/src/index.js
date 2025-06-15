import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.rtl.min.css';
// اتخاذ البيانات الموقته في الذاكرة الوسيطة
import { ApolloClient , InMemoryCache, gql , ApolloProvider , createHttpLink} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';



const httpLink = new createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'same-origin', // إذا كنت تستخدم المصادقة
});

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


const client = new ApolloClient( {
  link: authLink.concat(httpLink),
  cache : new InMemoryCache()

  
  
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



