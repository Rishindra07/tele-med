const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User.js');

const verifyAllUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for user verification script');

    // Update all users to be verified
    const result = await User.updateMany(
      {}, // matches all users
      { $set: { is_email_verified: true } }
    );

    console.log(`Successfully updated ${result.modifiedCount} users.`);
    console.log('All existing users (including seeds) are now email verified.');

    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
};

verifyAllUsers();
