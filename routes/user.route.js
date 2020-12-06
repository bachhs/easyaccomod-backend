const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/user.controller');

const router = express.Router();

router.post(
    '/register',
    [
        check('username').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('role').isIn(['renter', 'owner']),
        check('phone').isMobilePhone(),
        check('password').isLength({ min: 6 })
    ],
    usersController.register
);

router.get('/login', usersController.loginWithToken);
router.post('/login', usersController.loginWithEmailAndPassword);

module.exports = router;
