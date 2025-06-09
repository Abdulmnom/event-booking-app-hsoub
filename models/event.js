const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema( {
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    creature: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
        // timestamps: true // هذا الخيار يضيف حقول createdAt و updatedAt تلقائيًا للمعلومات الزمنية

}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
