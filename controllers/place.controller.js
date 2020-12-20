const { validationResult } = require('express-validator');

const User = require('../models/user.model');
const Place = require('../models/place.model');

const getPlaces = async (req, res, next) => {
    let places, placeCount;
    try {
        places = await Place.find().skip((req.query.page - 1) * 6).limit(6).populate('creator');
        placeCount = await Place.estimatedDocumentCount();
    }
    catch {
        res.status(404).send(
            'Co khong giu mat dung tim'
        );
    }
    res.json({
        placeCount: placeCount,
        places: places.map(place => {
            return {
                id: place._id,
                title: place.title,
                createdDate: place._id.getTimestamp(),
                description: place.description,
                address: place.address,
                price: place.price,
                type: place.type,
                image: place.images[0],
                star: 4.5,
                views: 100,
                area: place.area,
                creator: {
                    username: place.creator.username,
                    avatar: place.creator.avatar,
                    id: place.creator._id
                }
            }
        })
    });
}

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place, creator;
    try {
        place = await Place.findById(placeId);
        creator = await User.findById(place.creator);
    } catch (err) {
        res.status(500).send({ message: 'Something went wrong, could not find a place.' });
        return;
    }

    if (!place) {
        res.status(404).send({ message: 'Could not find place for the provided id.' })
        return;
    }

    res.json(
        {
            place: place.toJSON(),
            creator: {
                id: creator._id,
                username: creator.username,
                address: creator.address,
                email: creator.email,
                phone: creator.phone,
                avatar: creator.avatar
            }
        });
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

exports.getPlaces = getPlaces;
exports.getPlaceById = getPlaceById;
exports.createPlace = createPlace;