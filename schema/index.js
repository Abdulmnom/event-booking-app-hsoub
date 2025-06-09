const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Query {
        hello: String
        goodbye: String!
    }
`;

module.exports = {typeDefs};
