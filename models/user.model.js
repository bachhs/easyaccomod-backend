const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    activated: { type: Boolean, required: true },
    citizen: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    avatar: { type: String },
    favorite: [{ type: mongoose.Types.ObjectId }],
    password: { type: String, required: true },
});

userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret.password;
        delete ret.favorite;
        delete ret.citizen;
        delete ret._id;
        delete ret.__v;
    }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
