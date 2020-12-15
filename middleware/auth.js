const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            res.status(401).send({ message: 'Authorization token missing' });
            return;
        }
        const decodedToken = jwt.verify(token, process.env.SECRET);
        req.userData = { userId: decodedToken.userId };
        next();
    } catch (err) {
        res.status(403).send({ message: 'Authentication failed!' });
        return;
    }
};
