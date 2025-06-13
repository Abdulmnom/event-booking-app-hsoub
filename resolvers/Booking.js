const Booking = require('../models/booking');
const { transformBooking } = require('./transforms');
const { UserInputError } = require('apollo-server-errors');
const { combileResolvers } = require('graphql-resolvers');
const isLogedIn = require('../middleware/isLogin');
const Event = require('../models/event');
const { AuthenticationError } = require('apollo-server-errors');
const { combineResolvers } = require('graphql-resolvers'); // تم الحذف

const bookingResolvers = {
    Query : {
           bookings: combineResolvers(isLogedIn, async(_,args,context) => {
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
            )

    }, 
    Mutation : {
          bookEvent:combineResolvers(isLogedIn, async (_, args, context) => {
            // تحقق من تسجيل الدخول يدوياً
            isLogedIn(context);
            if (!args.eventId) {
                throw new UserInputError('معرف الحدث فارغ');
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
        }),
        cancelBooking: combineResolvers(isLogedIn, async (_, args, context) => {
            // تحقق من تسجيل الدخول يدوياً
             isLogedIn(context);
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
                const event = transformEvent(booking.event);

                // حذف الحجز من قاعدة البيانات
                Booking.deleteOne({ _id: args.bookingId });
                return {...event}
            } catch (err) {
                throw new UserInputError('حدث خطأ أثناء إلغاء الحجز', {
                    invalidArgs: args.bookingId
                 },  
                );
                
            }
        },
  )  }

}
module.exports = { bookingResolvers}
