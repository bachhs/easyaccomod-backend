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

router.post('/login', usersController.loginWithEmailAndPassword);
router.get('/:uid/favorite', usersController.getFavoriteList);
router.get('/:uid/places', usersController.getCreatedPlace);

router.get('/', usersController.getUserList);
router.use(auth);

router.get('/login', usersController.loginWithToken);
router.patch('/favorite', usersController.updateFavorite);
router.get('/:uid', usersController.getUser);
router.patch('/:uid/activate', usersController.activateUser);

module.exports = router;
