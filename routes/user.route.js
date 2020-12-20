const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/user.controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.post(
    '/register',
    [
        check('username').notEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('role').isIn(['renter', 'owner']),
        check('phone').isMobilePhone(),
        check('password').isLength({ min: 6 })
    ],
    usersController.register
);

router.get('/login', usersController.loginWithToken);
router.post('/login', usersController.loginWithEmailAndPassword);

router.use(auth);

router.get('/favorite', usersController.getFavoriteList);
router.patch('/favorite', usersController.updateFavorite);

module.exports = router;
