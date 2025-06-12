const Event = require('../models/event');
const { transformEvent } = require('./transforms');
const { UserInputError } = require('apollo-server-errors');
const { combileResolvers } = require('graphql-resolvers');
const isLogedIn = require('../middleware/isLogin');

const eventResolvers = {}
module.exports = { eventResolvers}