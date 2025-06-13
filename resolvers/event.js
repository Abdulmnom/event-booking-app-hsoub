const Event = require('../models/event');
const { transformEvent } = require('./transforms');
const { UserInputError, AuthenticationError } = require('apollo-server-errors');
const { combineResolvers } = require('graphql-resolvers');
const isLogedIn = require('../middleware/isLogin');

const eventResolvers = {
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

    },
    Mutation :{ 
        // context يحتوي على المستخدم الذي قام بتسجيل الدخول
              createEvent: combineResolvers(isLogedIn, async (_, args, context)=> {
               isLogedIn(context);
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
              }),
        
              
                    // updateEvent 
                    updateEvent: combineResolvers(isLogedIn, async (_, args, context) => {
                      isLogedIn(context);
                      try {
                          const event = await Event.findById(args.eventId);
                          if (!event) {
                              throw new UserInputError('هذا الحدث غير موجود');
                          }
                          if (event.creator._id.toString() !== context.user._id.toString()) {
                              throw new AuthenticationError("لا يمكنك تعديل حدث غيرك");
                          }
                          const updatedEvent = await Event.findByIdAndUpdate(args.eventId, args.eventInput, { new: true });
                          return transformEvent(updatedEvent);
                      } catch (err) {
                          console.error('Update Event Error:', err);
                          throw new UserInputError('حدث خطأ أثناء تحديث الحدث', {
                              invalidArgs: args.eventId
                          });
                      }
                    }),
              
                    deleteEvent : combineResolvers(isLogedIn, async (_, args ,context ) => {
                      try {
                          await Event.deleteOne( {_id: args.eventId } );
                          
                          return Event.find({});
              
              
                      } catch (err) {
                          throw new UserInputError('حدث خطأ أثناء حذف الحدث', {
                              invalidArgs: args.eventId
                          });
                      }
                    }),
    }
}
module.exports = { eventResolvers}