const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title: { type: String, required: true },
    address: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number }
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
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

placeSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Place', placeSchema);