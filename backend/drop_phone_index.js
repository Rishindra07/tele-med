const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dropIndex = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        console.log('Checking indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(idx => idx.name));

        if (indexes.find(idx => idx.name === 'phone_1')) {
            console.log('Dropping phone_1 index...');
            await collection.dropIndex('phone_1');
            console.log('Index dropped successfully.');
        } else {
            console.log('phone_1 index not found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error dropping index:', error);
        process.exit(1);
    }
};

dropIndex();
