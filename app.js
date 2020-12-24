const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require('mongoose');

const usersRoutes = require('./routes/user.route');
const placesRoutes = require('./routes/place.route');
const chatRoutes = require('./routes/chat.route');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api", (req, res) => {
    res.json({ message: "Welcome to the howling abyss." });
});

const uri = process.env.DATABASE_URI;

mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true })
    .then(() => {
    })
    .catch(err => {
        console.log(err);
    });

const PORT = process.env.PORT || 5000;
var http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});

http.listen(5000, () => {
    console.log(`listening on ${PORT}`);
});

app.use(function (req, res, next) {
    req.io = io;
    next();
});

app.use('/api/users', usersRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/chat', chatRoutes);