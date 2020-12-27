const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationsSchema = new Schema({
    type: { type: String, enum: ['ADMIN', 'ACTIVATED', 'UNAVAILABLE'], required: true },
    place: { type: mongoose.Types.ObjectId, ref: 'Place' },
});

notificationsSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    },
});

module.exports = mongoose.model('Notification', notificationsSchema);
