
const { UserInputError } = require('apollo-server-errors');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const resolvers = {
    Query: {

      
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
                    token: jwt.sign(userForToken , process.env.JWT_SECRET) ,
                    username: user.username,
                    // tokenExpiration: 1 // مدة صلاحية التوكن بالثواني
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
                token: jwt.sign(userForToken , process.env.JWT_SECRET) ,
                username: user.username,
                // tokenExpiration: 1 // مدة صلاحية التوكن بالثواني
            }

        } catch (err) {
            throw err;
        }
     }
    },


}

module.exports = { resolvers}