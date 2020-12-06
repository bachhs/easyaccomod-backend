const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require('mongoose');

const usersRoutes = require('./routes/user.route');
const Role = require("./models/role.model");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api", (req, res) => {
    res.json({ message: "Welcome to bezkoder application." });
});
app.use('/api/users', usersRoutes);

const uri = process.env.DATABASE_URI;

mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
        initial();
    })
    .catch(err => {
        console.log(err);
    });

const initial = () => {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: 'renter'
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'renter' to roles collection");
            });

            new Role({
                name: "owner"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'owner' to roles collection");
            });

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'admin' to roles collection");
            });
        }
    });
}