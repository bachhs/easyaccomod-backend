const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    type: { type: String, enum: ['Phòng trọ', 'Chung cư', 'Nhà nguyên căn'], required: true },
    room: { type: Number, required: true },
    area: { type: Number, required: true },
    price: { type: Number, required: true },
    host: { type: Boolean, required: true },
    bathroom: { type: String, required: true },
    kitchen: { type: String, enum: ['Khu bếp riêng', 'Khu bếp chung', 'Không nấu ăn'], required: true },
    waterHeater: { type: Boolean, required: true },
    airconditioner: { type: Boolean, required: true },
    balcony: { type: Boolean, required: true },
    electricPrice: { type: Number, required: true },
    waterPrice: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }],
    activated: { type: Boolean, required: true },
    available: { type: Boolean, default: true, required: true },
    endDate: { type: Date, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    reviews: [{
        creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
        rating: { type: Number, required: true },
        message: { type: String }
    }],
    views: { type: Number, required: true, default: 0 }
});

placeSchema.virtual('star').get(function () {
    if (this.reviews.length === 0)
        return 0;
    return this.reviews.
        reduce(((accumulator, currentValue) => accumulator + currentValue.rating), 0)
        / this.reviews.length;
});

placeSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret.reviews;
        delete ret._id;
        delete ret.__v;
    },

});

module.exports = mongoose.model('Place', placeSchema);