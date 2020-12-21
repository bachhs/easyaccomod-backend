const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require('mongoose');

const usersRoutes = require('./routes/user.route');
const placesRoutes = require('./routes/place.route');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api", (req, res) => {
    res.json({ message: "Welcome to the howling abyss." });
});

app.use('/api/users', usersRoutes);
app.use('/api/places', placesRoutes);

const uri = process.env.DATABASE_URI;

mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true })
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    })
    .catch(err => {
        console.log(err);
    });