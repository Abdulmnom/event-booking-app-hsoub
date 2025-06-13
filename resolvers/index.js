const { UserInputError, AuthenticationError } = require('apollo-server-errors');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Event = require('../models/event');
const Booking = require('../models/booking');
const { transformEvent, transformBooking } = require('./transforms');

const resolvers = {
  Query: {
    events: async () => {
      try {
        const events = await Event.find({}).populate('creator');
        const validEvents = events.filter(event => event.creator);
        if (!validEvents || validEvents.length === 0) {
          throw new UserInputError('لا توجد أحداث متاحة');
        }

        return validEvents.map(event => transformEvent(event));
      } catch (error) {
        throw error;
      }
    },

    getUserEvents: async (_, args) => {
      try {
        const events = await Event.find({ creator: args.userId }).populate('creator');
        if (!events || events.length === 0) {
          throw new UserInputError('لا توجد أحداث لهذا المستخدم');
        }
        return events.map(event => transformEvent(event));
      } catch (error) {
        throw error;
      }
    },

    bookings: async (_, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("يجب تسجيل دخولك!");
      }
      try {
        const bookings = await Booking.find({ user: context.user._id })
          .populate('event')
          .populate('user');
        return bookings.map(booking => transformBooking(booking));
      } catch (error) {
        throw error;
      }
    }
  },

  Mutation: {
    createUser: async (_, args) => {
      try {
        const existingUser = await User.findOne({ email: args.userInput.email });
        if (existingUser) {
          throw new UserInputError('هذا الحساب مسجل مسبقا لدينا', {
            invalidArgs: args.userInput.email
          });
        }

        const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

        const user = new User({
          username: args.userInput.username,
          email: args.userInput.email,
          password: hashedPassword,
        });

        const result = await user.save();

        const userForToken = {
          email: user.email,
          id: user._id
        };

        return {
          userId: user._id,
          token: jwt.sign(userForToken, process.env.JWT_SECRET),
          username: user.username,
        };
      } catch (err) {
        throw err;
      }
    },

    login: async (_, args) => {
      try {
        const user = await User.findOne({ email: args.email });
        if (!user) {
          throw new UserInputError('هذا الحساب غير موجود');
        }

        const isEqual = await bcrypt.compare(args.password, user.password);
        if (!isEqual) {
          throw new UserInputError('خطاء في البريد الالكتروني او كلمة المرور');
        }

        const userForToken = {
          email: user.email,
          id: user._id
        };

        return {
          userId: user._id,
          token: jwt.sign(userForToken, process.env.JWT_SECRET),
          username: user.username,
        };
      } catch (err) {
        throw err;
      }
    },

    createEvent: async (_, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("يجب تسجيل دخولك!");
      }

      try {
          const existngEvent = await Event.findOne({ title: args.eventInput.title });
          if (existngEvent) {
              throw new UserInputError('هذا الحدث موجود مسبقا لدينا');
          }

          const event = new Event({
              title: args.eventInput.title,
              description: args.eventInput.description,
              date: new Date(args.eventInput.date),
              price: +args.eventInput.price,
              creator: context.user._id
          });

          const result = await event.save();
          return transformEvent(result);
      } catch (err) {
          console.error('Create Event Error:', err);
          throw new UserInputError('حدث خطأ أثناء إنشاء الحدث', {
              invalidArgs: args.eventInput
          });
      }
    },

    updateEvent: async (_, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("يجب تسجيل دخولك!");
      }
      try {
        const event = await Event.findById(args.eventId);
        if (!event) {
          throw new UserInputError('الحدث غير موجود');
        }
        if (event.creator.toString() !== context.user._id.toString()) {
          throw new AuthenticationError("لا يمكنك تعديل حدث غيرك");
        }
        event.title = args.eventInput.title;
        event.description = args.eventInput.description;
        event.date = new Date(args.eventInput.date);
        event.price = +args.eventInput.price;
        await event.save();
        return transformEvent(event);
      } catch (err) {
        throw new UserInputError('حدث خطأ أثناء تحديث الحدث', {
          invalidArgs: args.eventId
        });
      }
    },

    deleteEvent: async (_, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("يجب تسجيل دخولك!");
      }
      try {
        const event = await Event.findById(args.eventId);
        if (!event) {
          throw new UserInputError('الحدث غير موجود');
        }
        if (event.creator.toString() !== context.user._id.toString()) {
          throw new AuthenticationError("لا يمكنك حذف حدث غيرك");
        }
        await Event.deleteOne({ _id: args.eventId });
        const events = await Event.find({}).populate('creator');
        return events.map(event => transformEvent(event));
      } catch (err) {
        throw new UserInputError('حدث خطأ أثناء حذف الحدث', {
          invalidArgs: args.eventId
        });
      }
    },

    bookEvent: async (_, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("يجب تسجيل دخولك!");
      }
      if (!args.eventId) {
        throw new UserInputError('معرف الحدث فارغ');
      }

      const existingBooking = await Booking.findOne({ event: args.eventId, user: context.user._id });
      if (existingBooking) {
        throw new UserInputError('لديك حجز لهذا الحدث مسبقاً');
      }

      const fetchEvent = await Event.findById(args.eventId);
      if (!fetchEvent) {
        throw new UserInputError('هذا الحدث غير موجود');
      }

      const booking = new Booking({
        event: fetchEvent._id,
        user: context.user._id
      });

      try {
        const result = await booking.save();
        return transformBooking(result);
      } catch (err) {
        throw new UserInputError('حدث خطأ أثناء حجز الحدث', {
          invalidArgs: args.eventId
        });
      }
    },

    cancelBooking: async (_, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("يجب تسجيل الدخول");
      }

      try {
        if (!args.bookingId) {
          throw new UserInputError('معرف الحجز مطلوب');
        }

        // طباعة معلومات تشخيصية
        console.log('User attempting to cancel booking:', {
            bookingId: args.bookingId,
            userId: context.user._id
        });

        // البحث عن الحجز
        const booking = await Booking.findById(args.bookingId);
        
        // طباعة نتيجة البحث
        console.log('Found booking:', booking);

        if (!booking) {
            // تحقق من وجود حجوزات للمستخدم
            const userBookings = await Booking.find({ user: context.user._id });
            console.log('User bookings:', userBookings.map(b => b._id));
            
            throw new UserInputError('هذا الحجز غير موجود - الرجاء التحقق من معرف الحجز');
        }

        // تحميل معلومات الحدث
        await booking.populate('event');

        if (booking.user.toString() !== context.user._id.toString()) {
            throw new AuthenticationError("لا يمكنك إلغاء حجز غيرك");
        }

        const event = booking.event;
        
        // حذف الحجز
        await Booking.findByIdAndDelete(args.bookingId);
        
        console.log('Successfully cancelled booking');
        
        return transformEvent(event);
      } catch (err) {
        console.error('Detailed error in cancelBooking:', {
            error: err.message,
            bookingId: args.bookingId,
            userId: context.user._id
        });
        
        throw new UserInputError('حدث خطأ أثناء إلغاء الحجز', {
            invalidArgs: args.bookingId
        });
      }
    }
  }
};

module.exports = { resolvers };
