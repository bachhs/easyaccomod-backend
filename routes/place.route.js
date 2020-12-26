const express = require('express');
const { check } = require('express-validator');

const placesController = require('../controllers/place.controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:pid/review', placesController.getReviews);
router.get('/:pid', placesController.getPlaceById);
router.get('/', placesController.getPlaces);

router.use(auth);

router.post(
    '/new',
    [
        check('title').not().isEmpty(),
        check('address').notEmpty(),
        check('location.*').isFloat(),
        check('type').isIn(['Phòng trọ', 'Chung cư', 'Nhà nguyên căn']),
        check('room').isInt({ gt: 0 }),
        check('area').isNumeric({ gt: 0 }),
        check('price').isNumeric({ gt: 0 }),
    ],
    placesController.createPlace
);

router.post('/:pid/review', placesController.postReview);
router.patch('/:pid/activate', placesController.activatePlace);
router.patch('/:pid/available', placesController.setAvailablePlace);
router.put(
    '/:pid',
    [
        check('title').not().isEmpty(),
        check('address').notEmpty(),
        check('location.*').isFloat(),
        check('type').isIn(['Phòng trọ', 'Chung cư', 'Nhà nguyên căn']),
        check('room').isInt({ gt: 0 }),
        check('area').isNumeric({ gt: 0 }),
        check('price').isNumeric({ gt: 0 }),
    ], placesController.editPlace);

module.exports = router;
