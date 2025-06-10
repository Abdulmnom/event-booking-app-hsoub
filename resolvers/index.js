
const { UserInputError, AuthenticationError } = require('apollo-server-errors');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Event = require('../models/event');
const event = require('../models/event');
const resolvers = {
    Query: {
        events: async () => {
            try {
                const events = await Event.find({}).populate('creator');

                return events.map(event => ({
                    ...event._doc,
                    date: event.date.toDateString(),
                }));
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
                return events.map(event => ({...event._doc , date: event.date.toDateString()}));
            } catch (error) {
                throw error;
            }
        }

      
    },
     Mutation : {
        /**
         * Create a new user with the given input data.
         * @param {object} parent - The parent object.
         * @param {object} args - The input data for creating a new user.
         * @property {string} args.userInput.username - The username to be used for the new user.
         * @property {string} args.userInput.email - The email address to be used for the new user.
         * @property {string} args.userInput.password - The password to be used for the new user.
         * @returns {object} A new user object with a JWT token.
         */
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
                    token: jwt.sign(userForToken , process.env.JWT_SECRET, { expiresIn: '10h' }), // Set token expiration time to 1 hour,
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
                token: jwt.sign(userForToken , process.env.JWT_SECRET, { expiresIn: '10h' }), // Set token expiration time to 1 hour,
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
            date: args.eventInput.date,
            price: +args.eventInput.price, // تحويل السعر إلى عدد عشري
            creator: context.user._id // ربط الحدث بالمستخدم الذي أنشأه
        })

        try {
            await event.save();
            // event._doc هو كائن يحتوي على بيانات الحدث المحفوظة في قاعدة البيانات الخاصه ب MongoDB     لانه مخزن كادكيمنت
            return {...event._doc , data: event.date.toDateString()};
        } catch (err) {
            throw new UserInputError('حدث خطأ أثناء إنشاء الحدث', {
                invalidArgs: args.eventInput
            });
        }
      },
      deleteEvent : async (_, args ,context ) => {
        try {
            await Event.deleteOne( {_id: args.eventId } );
            const events = await Event.find({}).populate('creator');
            return events.find({})


        } catch (err) {
            throw new UserInputError('حدث خطأ أثناء حذف الحدث', {
                invalidArgs: args.eventId
            });
        }
      }
    },


}

module.exports = { resolvers}