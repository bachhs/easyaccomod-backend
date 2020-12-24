const express = require('express');

const chatController = require('../controllers/chat.controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/:uid', chatController.getChatWithUser);
router.post('/:uid', chatController.postChatWithUser);
router.get('/', chatController.getThreads);

module.exports = router;
