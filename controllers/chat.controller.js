const Chat = require('../models/chat.model');
const User = require('../models/user.model');

const getThreads = async (req, res, next) => {
    const userId = req.userData.userId;

    try {
        const threads = await Chat.find({ recipients: userId }).populate('recipients', 'id avatar username');
        res.json({
            threads: threads.map(thread => {
                return {
                    id: thread.id,
                    recipients: thread.recipients,
                    lastestMessage: thread.messages[thread.messages.length - 1]
                }
            })
        });
    }
    catch (err) {
        res.status(404).send({ message: 'Something went wrong' });
    }
}

const getChatWithUser = async (req, res, next) => {
    const from = req.userData.userId;
    const to = req.params.uid;

    try {
        let existingChat = await Chat.findOne({
            recipients: { $all: [from, to] }
        }).populate('messages.sender', 'username avatar id');
        res.status(200).send({ thread: existingChat });
    }
    catch (err) {
        res.status(500).send({ message: 'Database error' });
    }
}

const postChatWithUser = async (req, res, next) => {
    const from = req.userData.userId;
    const to = req.params.uid;

    try {
        let existingChat = await Chat.findOne({
            recipients: { $all: [from, to] }
        })
        if (!existingChat)
            existingChat = new Chat({
                recipients: [from, to],
                messages: [{
                    sender: from,
                    body: req.body.message,
                }]
            });
        else {
            existingChat.messages.push({ sender: from, body: req.body.message });
        }
        existingChat.save();
        req.io.sockets.emit('messages', req.body.message);
        res.status(201).send({ message: 'Success' });
    }
    catch (err) {
        res.status(500).send({ message: 'Database error' });
    }
}

exports.getThreads = getThreads;
exports.getChatWithUser = getChatWithUser;
exports.postChatWithUser = postChatWithUser;