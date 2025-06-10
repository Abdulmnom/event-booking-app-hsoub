const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Query {
       events: [Event]
       bookings: [Booking]
       getUserEvents(userId: ID!): [Event]
        getUserBookings(userId: ID!): [Booking]
    }

    type User {
        _id: ID!
        username: String!
        email: String!
        password: String!
    }
    type Event {
        _id: ID!
        title: String!
        description: String!
        date: String!
        price: Float!
        creature: User!
    }

    type Booking {
        _id: ID!
        event: Event!
        user: User!
        createdAt: String!
        updatedAt: String!
    }

    type Mutation {
        createUser(userInput: UserInput!) : AuthData
        createEvent(eventInput: EventInput!): Event
        bookEvent(eventId: ID!): Booking
        cancelBooking(booking: ID !) : Event
        login(email: String!, password: String!) : AuthData
        deleteEvent(eventId: ID!): [Event]
    }

    type AuthData {
        userId: ID!
        token: String!
        username: String!
        # tokenExpiration: Int!
    }
    input UserInput {
        username: String!
        email: String!
        password: String!

    }
    input EventInput {
        title: String!
        description: String!
        date: String!
        price: Float!
    }
    input BookingInput {
        eventId: ID!
    }
`;

module.exports = {typeDefs};
