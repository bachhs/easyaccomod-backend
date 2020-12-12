const express = require('express');
const { check } = require('express-validator');

const placesController = require('../controllers/place.controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post(
    '/new',
    placesController.createPlace
);

module.exports = router;
