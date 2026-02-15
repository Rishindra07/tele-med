const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        // 1️⃣ Check header exists
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // 2️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3️⃣ Get user from DB
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        // 4️⃣ Attach user to request
        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({ message: "Token invalid or expired" });
    }
};

module.exports = protect;