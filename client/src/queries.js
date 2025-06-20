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
        date
        price
      }
      user {
        _id
        username
      }
      createdAt
    }
  }
`;
export const CREATE_BOOKING = gql`
  mutation CreateBooking($eventInput: EventInput!) {
    createBooking(eventInput: $eventInput) {
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

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($bookingId: ID!) {
    cancelBooking(bookingId: $bookingId) {
      _id
      title
      description
      date
      price
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






export const CREATE_EVENT = gql`
  mutation CreateEvent($eventInput: EventInput!) {
    createEvent(eventInput: $eventInput) {
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

export const EVENT_ADDED_SUBSCRIPTION = gql`
  subscription {
    eventAdded {
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