const app = require('./app.js');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db.js')

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => {
            console.log(`server running on http://localhost:${PORT}/`);
        })
    } catch (error) {
        console.log(error)
    }
}

start();