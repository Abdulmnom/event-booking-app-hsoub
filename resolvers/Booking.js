const Booking = require('../models/booking');
const { transformBooking } = require('./transforms');
const { UserInputError } = require('apollo-server-errors');
const { combileResolvers } = require('graphql-resolvers');
const isLogedIn = require('../middleware/isLogin');
const Event = require('../models/event');

const bookingResolvers = {}
module.exports = { bookingResolvers}
