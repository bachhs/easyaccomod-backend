const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');

const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).send({ message: 'Invalid inputs passed, please check your data.' });
        return;
    }

    const { username, email, role, citizen, address, phone, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        res.status(500).send({ message: 'Register failed, please try again later.' });
        return;
    }

    if (existingUser) {
        res.status(422).send({ message: 'User exists already, please login instead.' });
        return;
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 10);
    } catch (err) {
        res.status(500).send({ message: 'Register failed, please try again later.' });
        return;
    }

    const createdUser = new User({
        username,
        email,
        role,
        activated: (role == "renter"),
        citizen,
        address,
        phone,
        password: hashedPassword,
    });

    try {
        await createdUser.save();
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Database Register failed, please try again later.' });
        return;
    }

    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id },
            process.env.SECRET,
            { expiresIn: '1d' }
        );
    } catch (err) {
        res.status(500).send({ message: 'Signing up failed, please try again later.' });
        return;
    }
    res
        .status(201)
        .json({
            user: {
                id: createdUser.id, username: createdUser.username, email: createdUser.email,
                role: createdUser.role, activated: createdUser.activated, citizen: createdUser.citizen,
                address: createdUser.address, phone: createdUser.phone, avatar: createdUser.avatar,

            }, accessToken: token
        });
};

const loginWithEmailAndPassword = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        res.status(500).send({ message: 'Logging in failed, please try again later.' });
        return;
    }

    if (!existingUser) {
        res.status(403).send({ message: 'Invalid credentials, could not log you in.' });
        return;
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        res.status(500).send({ message: 'Could not log you in, please check your credentials and try again.' });
        return;
    }

    if (!isValidPassword) {
        res.status(403).send({ message: 'Invalid credentials, could not log you in.' })
        return;
    }

    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id },
            process.env.SECRET,
            { expiresIn: '1d' }
        );
    } catch (err) {
        res.status(500).send({ message: 'Logging in failed, please try again later.' });
        return;
    }

    res
        .status(200)
        .json({
            user: {
                id: existingUser.id, username: existingUser.username, email: existingUser.email,
                role: existingUser.role, activated: existingUser.activated, citizen: existingUser.citizen,
                address: existingUser.address, phone: existingUser.phone, avatar: existingUser.avatar,

            }, accessToken: token
        });
};

const loginWithToken = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        res.status(401).send({ message: 'Authorization token missing' });
    }

    try {
        const accessToken = authorization.split(' ')[1];

        const { userId } = jwt.verify(accessToken, process.env.SECRET);

        const existingUser = await User.findOne({ _id: userId });

        return res.status(200).json({
            user: {
                id: existingUser.id, username: existingUser.username, email: existingUser.email,
                role: existingUser.role, activated: existingUser.activated, citizen: existingUser.citizen,
                address: existingUser.address, phone: existingUser.phone, avatar: existingUser.avatar,

            }
        });
    } catch (error) {
        return res.status(401).send({ message: 'Invalid authorization token' });
    }
}

exports.register = register;
exports.loginWithEmailAndPassword = loginWithEmailAndPassword;
exports.loginWithToken = loginWithToken;
