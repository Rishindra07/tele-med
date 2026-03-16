const mongoose = require('mongoose');

const connectDB = (url) => {
    console.log("MongoDB connected")
    return mongoose.connect(url
    )
}

module.exports = connectDB;