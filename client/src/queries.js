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
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      userId
      token
      username
    }
  }
`;

export const BOOKINGS = gql`
  query Bookings {
    bookings {
      _id
      event {
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
      user {
        _id
        username
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($userInput: UserInput!) {
    createUser(userInput: $userInput) {
      userId
      token
      username
    }
  }
`;

// export const BOOKINGS = gql`
//   ${EVENT_FIELDS}
//   query Bookings{
//     bookings {
//       _id
//       createdAt
//       event {
//        ...EventFields
//       }
//       user{
//         username
//         email
//       }
//     }
//   }
// ` 

// export const CANCEL_BOOKING = gql`
//   mutation CancelBooking($bookingId: ID!){
//     cancelBooking(bookingId: $bookingId) {
//       _id
//       title
//     }
//   }
// ` 

// export const EVENT_ADDED = gql`
//   ${EVENT_FIELDS}
//   subscription {
//     eventAdded {
//       ...EventFields
//     }
//   }
// `