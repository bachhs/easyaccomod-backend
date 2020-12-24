const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    recipients: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    messages: [{
        sender: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        body: {
            type: String,
            required: true,
        },
    }
    ]
});

module.exports = mongoose.model('Chat', chatSchema);
