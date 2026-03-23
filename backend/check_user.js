const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const check = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'patient1@example.com' }).select('+password_hash');
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
        console.log('Role:', user.role);
        console.log('Password Hash in DB:', user.password_hash);
        const bcrypt = require('bcryptjs');
        const match = await bcrypt.compare('password123', user.password_hash);
        console.log('Password Match Check:', match ? 'Succeeded' : 'Failed');
    }
    process.exit();
};
check();
