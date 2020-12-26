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
router.get('/login', auth, usersController.loginWithToken);
router.patch('/favorite', auth, usersController.updateFavorite);
router.patch('/:uid/activate', auth, usersController.activateUser);
router.get('/:uid/favorite', usersController.getFavoriteList);
router.get('/:uid/places', usersController.getCreatedPlace);
router.put('/:uid', usersController.editUser);
router.get('/:uid', usersController.getUser);
router.get('/', usersController.getUserList);

module.exports = router;
