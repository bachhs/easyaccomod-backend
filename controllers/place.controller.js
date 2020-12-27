const { validationResult } = require('express-validator');

const User = require('../models/user.model');
const Place = require('../models/place.model');
const Notification = require('../models/notification.model');

const getPlaces = async (req, res, next) => {
    let places, placeCount;
    const keyword = req.query.q || '';
    const type = req.query.type || ['Phòng trọ', 'Chung cư', 'Nhà nguyên căn'];
    const bathroom = req.query.bathroom || ['Khép kín', 'Chung'];
    const kitchen = req.query.kitchen || ['Khu bếp riêng', 'Khu bếp chung', 'Không nấu ăn'];
    const airconditioner = req.query.airconditioner || [0, 1];
    const waterHeater = req.query.waterHeater || [0, 1];
    const orderBy = req.query.orderBy || '_id';
    const start = req.query.start * 1000000 || 0;
    const end = req.query.end * 1000000 || 20000000;
    const order = req.query.order === 'asc' ? '+' : '-';
    const page = req.query.page;
    const available = req.query.page ? [1] : [1, 0];
    const activated = req.query.page ? [1] : [1, 0];
    try {
        places = await Place.find({
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { address: { $regex: keyword, $options: "i" } },
            ],
            type: { $in: type },
            bathroom: { $in: bathroom },
            kitchen: { $in: kitchen },
            airconditioner: { $in: airconditioner },
            waterHeater: { $in: waterHeater },
            price: { $gte: start, $lte: end },
            available: { $in: available },
            activated: { $in: activated },
        }).sort(order + orderBy).populate('creator', 'username email avatar id');
        if (orderBy === 'star')
            places.sort((a, b) => {
                if (order === '-')
                    return b.star - a.star;
                return a.star - b.star;
            });
        placeCount = places.length;
        const perPage = 6;
        if (page)
            places = places.slice((page - 1) * perPage, page * perPage);
    }
    catch {
        res.status(404).send(
            'Co khong giu mat dung tim'
        );
        return;
    }
    res.json({
        placeCount: placeCount,
        places: places.map(place => {
            return {
                id: place._id,
                title: place.title,
                createdDate: place._id.getTimestamp(),
                description: place.description,
                activated: place.activated,
                available: place.available,
                address: place.address,
                price: place.price,
                type: place.type,
                image: place.images[0],
                star: place.star,
                views: place.views,
                area: place.area,
                creator: {
                    username: place.creator.username,
                    email: place.creator.email,
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
    place.views += 1;
    place.save();
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
        res.status(500).send({ message: 'Database Register failed, please try again later.' });
        return;
    }

    try {
        const notification = new Notification({
            type: 'ADMIN',
            place: createdPlace._id
        });
        await notification.save();
    }
    catch {
    }
    res.status(201).json({ placeId: createdPlace._id });
}

const editPlace = async (req, res, next) => {
    let user, place;
    const { pid } = req.params;
    try {
        user = await User.findOne({ _id: req.userData.userId });
        place = await Place.findOne({ _id: pid });
        if (!(user.role === 'admin' || place.creator.equals(user._id))) {
            res.status(403).send({ message: 'You are not allowed to edit this place.' });
            return;
        }
    }
    catch (err) {
        res.status(500).send({ message: 'Authorization failed, please try again later.' })
        return;
    }

    try {
        const session = await Place.startSession();
        session.startTransaction();

        const { title, type, room, area, price,
            host, bathroom, kitchen, waterHeater, airconditioner, balcony,
            electricPrice, waterPrice, description, endDate } = req.body;
        place.title = title;
        place.type = type;
        place.room = room;
        place.area = area;
        place.price = price;
        place.host = host;
        place.bathroom = bathroom;
        place.kitchen = kitchen;
        place.waterHeater = waterHeater;
        place.airconditioner = airconditioner;
        place.balcony = balcony;
        place.electricPrice = electricPrice;
        place.waterPrice - waterPrice;
        place.description = description;
        place.endDate = endDate;
        await place.save();

        session.endSession();
        res.status(200).json({ message: 'Update successfully' });
    }
    catch (err) {
        res.status(500).send({ message: 'Authorization failed, please try again later.' })
        return;
    }
}

const getReviews = async (req, res, next) => {
    const placeId = req.params.pid;
    if (!placeId) {
        res.status(401).send({ message: 'Cannot get place ID' });
        return;
    }
    try {
        const place = await Place.findById(placeId).populate('reviews.creator', 'username avatar id');
        res.status(200).json({
            reviews: place.reviews.map(review => {
                return {
                    id: review._id,
                    rating: review.rating,
                    message: review.message,
                    createdAt: review._id.getTimestamp(),
                    creator: {
                        username: review.creator.username,
                        avatar: review.creator.avatar,
                        id: review.creator._id
                    }
                }
            })
        });
    }
    catch (error) {
        res.status(404).json({ message: 'Cannot find place' });
    }
}

const postReview = async (req, res, next) => {
    const placeId = req.params.pid;
    const review = req.body.review;
    if (!placeId) {
        res.status(401).send({ message: 'Invalid place ID' });
        return;
    }
    try {
        place = await Place.findById(placeId);
        let existingReview = place.reviews.filter(value => value.creator == review.creator);
        if (existingReview.length !== 0) {
            res.status(409).json({ message: 'Already reviewed' });
            return;
        }
        place.reviews.push(review);
        await place.save();
        res.status(201).json({ message: 'Review Successfully' });
    }
    catch (error) {
        res.status(404).json({ message: 'Cannot find place' });
    }
}

const activatePlace = async (req, res, next) => {
    const { userId } = req.userData;
    const { pid } = req.params;
    try {
        const user = await User.findOne({ _id: userId });
        if (user.role !== 'admin') {
            res.status(403).json('You cannot activate this user');
            return;
        }
        const place = await Place.findOne({ _id: pid });
        place.activated = true;
        await place.save();
        try {
            const notification = new Notification({
                type: 'ACTIVATED',
                place: place._id
            });
            await notification.save();
        }
        catch {
        }
        res.json({ message: 'Activated' });
    }
    catch {
        res.status(500).json({ message: 'Cannot activate, please try again' });
    };
}

const setAvailablePlace = async (req, res, next) => {
    const { userId } = req.userData;
    const { pid } = req.params;
    try {
        const user = await User.findOne({ _id: userId });
        const place = await Place.findOne({ _id: pid });
        if (!(user.role === 'admin' || place.creator !== user.id)) {
            res.status(403).json('You cannot set available this place');
            return;
        }
        place.available = false;
        await place.save();
        const notification = new Notification({
            type: 'UNAVAILABLE',
            place: place._id
        });
        await notification.save();
        res.json({ message: 'Success' });
    }
    catch {
        res.status(500).json({ message: 'Cannot activate, please try again' });
    };
}

exports.getPlaces = getPlaces;
exports.activatePlace = activatePlace;
exports.editPlace = editPlace;
exports.setAvailablePlace = setAvailablePlace;
exports.getPlaceById = getPlaceById;
exports.createPlace = createPlace;
exports.getReviews = getReviews;
exports.postReview = postReview;