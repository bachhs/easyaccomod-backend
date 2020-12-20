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

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
