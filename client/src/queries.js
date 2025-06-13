import { gql } from '@apollo/client';
export const EVENTS = gql`
  query Events {
    events {
      _id
      title
      description
      date
      price
      creator {
        _id
        username
        email
      }
    }
  }
`;