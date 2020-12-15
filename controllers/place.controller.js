const { validationResult } = require('express-validator');

const User = require('../models/user.model');
const Place = require('../models/place.model');

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        res.status(500).send({ message: 'Something went wrong, could not find a place.' });
        return;
    }

    if (!place) {
        res.status(404).send({ message: 'Could not find place for the provided id.' })
        return;
    }

    res.json({ place: place.toObject({ getters: true }) });
}

const createPlace = async (req, res, next) => {
    let user;
    try {
        user = await User.findOne({ _id: req.userData.userId });
        if (user.role === 'renter' || (user.role === 'owner' && !user.activated)) {
            res.status(403).send({ message: 'You are not allowed to post new place.' });
            return;
        }
    }
    catch (err) {
        res.status(500).send({ message: 'Authorization failed, please try again later.' })
        return;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.status(422).send({ message: 'Invalid inputs passed, please check your data.' });
        return;
    }

    const { title, address, location, type, room, area, price,
        host, bathroom, kitchen, waterHeater, airconditioner, balcony,
        electricPrice, waterPrice, description, images, endDate } = req.body;

    const createdPlace = new Place({
        title, address, location, type, room, area, price,
        host, bathroom, kitchen, waterHeater, airconditioner, balcony,
        electricPrice, waterPrice, description, images, endDate, activated: user.role == 'admin', creator: req.userData.userId
    });

    try {
        await createdPlace.save();
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Database Register failed, please try again later.' });
        return;
    }

    res.status(201).json({ placeId: createdPlace._id });
}

exports.getPlaceById = getPlaceById;
exports.createPlace = createPlace;