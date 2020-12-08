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
    number: { type: Number, required: true },
    area: { type: Number, required: true },
    price: { type: Number, required: true },
    host: { type: Boolean, required: true },
    bathroom: {
        shared: { type: Boolean, required: true },
        waterHeater: { type: Boolean, require: true }
    },
    kitchen: { type: String, enum: ['Khu bếp riêng', 'Khu bếp chung', 'Không nấu ăn'], required: true },
    airconditioner: { type: Boolean, required: true },
    balcony: { type: Boolean, required: true },
    electricPrice: { type: Number, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    activated: { type: Boolean, required: true },
    endDate: { type: Date },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

placeSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Place', placeSchema);