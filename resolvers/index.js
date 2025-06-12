const { UserInputError, AuthenticationError } = require('apollo-server-errors');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Event = require('../models/event');
const event = require('../models/event');
const Booking = require('../models/booking');
const { transformEvent, transformBooking } = require('./transforms');
const isLogedIn = require('../middleware/isLogin');
// const { combineResolvers } = require('graphql-resolvers') // تم الحذف
const { update } = require('lodash');
const resolvers = {
    Query: {
        events: async () => {
            try {
                const events = await Event.find({}).populate('creator');
                const validEvents = events.filter(event => event.creator); // فقط الأحداث التي لها creator
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
                const events = await Event.find({ creator: args.userId}).populate('creator');
                if (!events || events.length === 0) {
                    throw new UserInputError('لا توجد أحداث لهذا المستخدم');
                }
                return events.map(event => transformEvent(event));
            } catch (error) {
                throw error;
            }
        },
        bookings: async(_,args,context) => {
            try {
                // تحقق من تسجيل الدخول يدوياً
                if (!context.user) {
                    throw new AuthenticationError("يجب تسجيل الدخول");
                }
                const bookings = await Booking.find({ user: context.user._id }).populate('event').populate('user');
                return bookings.map(booking => transformBooking(booking));
            } catch (error) {
                throw error;
            }
        }
    },
    Mutation : {
      
        createUser : async (_, args) => {

            try {
                // Check if the given email address already exists in the database.
                const existingUser = await User.findOne({ email: args.userInput.email });
                if (existingUser) {
                    throw new UserInputError('هذا الحساب مسجل مسبقا لدينا '  , {
                        invalidArgs: args.userInput.email
                    })
                }
                // Hash the given password.
                const hashedPassword = await bcrypt.hash(args.userInput.password , 12);
                // Create a new user object with the given input data.
                const user = new User({
                    username: args.userInput.username,
                    email: args.userInput.email,
                    password: hashedPassword, // Store the hashed password in the database.
                })
                // Save the new user to the database.
                const result = await user.save();
                // Create a new JWT token for the new user.
                const userForToken = {
                    email: user.email,
                    id: user._id
                }
                return {
                    userId: user._id,
                    token: jwt.sign(userForToken , process.env.JWT_SECRET, /* { expiresIn: '10h' } */),
                    username: user.username,
                    
                }
            }
            catch (err) {
                throw err;
            }

        },

     login: async (_, args) => {
        try {
            const user = await User.findOne({ email : args.email });
            if (!user ) {
                throw new UserInputError(' هذا الحساب غير موجود ');
            }
            const isEqual = await bcrypt.compare(args.password, user.password);
            if (!isEqual) {
                throw new UserInputError('خطاء في البريد الالكتروني او كلمة المرور ')
            } 
            // إنشاء توكن JWT  و انشاء كائن المستخدم الذي سيتم تضمينه في التوكن
            const userForToken = {
                email: user.email,
                id: user._id
            }
            return {
                userId: user._id,
                token: jwt.sign(userForToken , process.env.JWT_SECRET, /* { expiresIn: '10h' } */),
                username: user.username,
                
            }

        } catch (err) {
            throw err;
        }
     },
     // context يحتوي على المستخدم الذي قام بتسجيل الدخول
      createEvent: async (_, args, context)=> {
        if(!context.user) {
            throw new AuthenticationError(" !يجب تسجيل دخولك")
        }
        const existngEvent = await Event.findOne( { title : args.eventInput.title } );
        if (existngEvent) {
            throw new UserInputError('هذا الحدث موجود مسبقا لدينا');
        }
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            date: new Date(args.eventInput.date), // تحويل التاريخ إلى كائن Date
            price: +args.eventInput.price, // تحويل السعر إلى عدد عشري
            creator: context.user._id // ربط الحدث بالمستخدم الذي أنشأه
        })

        try {
            await event.save();
            // event._doc هو كائن يحتوي على بيانات الحدث المحفوظة في قاعدة البيانات الخاصه ب MongoDB     لانه مخزن كادكيمنت
            return  transformEvent(event);
        } catch (err) {
            console.error('Create Event Error:', err);
            throw new UserInputError('حدث خطأ أثناء إنشاء الحدث', {
                invalidArgs: args.eventInput
            });
        }
      },
      deleteEvent : async (_, args ,context ) => {
        try {
            await Event.deleteOne( {_id: args.eventId } );
            
            return Event.find({});


        } catch (err) {
            throw new UserInputError('حدث خطأ أثناء حذف الحدث', {
                invalidArgs: args.eventId
            });
        }
      },
        bookEvent: async (_, args, context) => {
            // تحقق من تسجيل الدخول يدوياً
            if (!context.user) {
                throw new AuthenticationError("يجب تسجيل الدخول");
            }
            // تحقق مما إذا كان المستخدم قد حجز هذا الحدث بالفعل او لا
            const existngBooking = await Booking.find({ event: args.eventId }).find({ user: context.user._id }); 
            if (existngBooking) {
                throw new UserInputError('  لديك حجز لهذا الحدث مسبقاً');
            }

            // تحقق مما إذا كان الحدث موجوداً في قاعدة البيانات
            const eventExists = await Event.findById(args.eventId);
            if (!eventExists) {
                throw new UserInputError('  هذا الحدث غير موجود');
            }
            const fetchEvent = await Event.findOne({ _id: args.eventId });
            const booking = new Booking({
                event: fetchEvent._id,
                user: context.user._id
            })
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
            // تحقق من تسجيل الدخول يدوياً
            if (!context.user) {
                throw new AuthenticationError("يجب تسجيل الدخول");
            }
            try {
                console.log('Trying to cancel booking with ID:', args.bookingId);
                const booking = await Booking.findById(args.bookingId).populate('event');
                if (!booking) {
                    throw new UserInputError('هذا الحجز غير موجود');
                }
                if (args.bookingId === null || args.bookingId === undefined) {
                    throw new UserInputError('معرف الحجز  فارغ');
                }
                if (booking.user._id.toString() !== context.user._id.toString()) {
                    throw new AuthenticationError("لا يمكنك الغاء حجز غيرك");
                }
                const event = {...booking.event._doc, date: booking.event._doc.date.toDateString() }; // تحويل الحدث إلى كائن عادي
                Booking.deleteOne({ _id: args.bookingId });
                return event;
            } catch (err) {
                throw new UserInputError('حدث خطأ أثناء إلغاء الحجز', {
                    invalidArgs: args.bookingId
                 },  
                );
                
            }
        },
    },
}

module.exports = { resolvers }