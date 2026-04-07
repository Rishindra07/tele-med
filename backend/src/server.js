const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const { server } = require('./app.js');


const connectDB = require('./config/db.js')
const { startConsultationReminderService } = require("./services/consultationReminderService.js");

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        startConsultationReminderService();
        server.listen(PORT, () => {
            console.log(`server running on http://localhost:${PORT}/`);
        })
    } catch (error) {
        console.log(error)
    }
}

start();
