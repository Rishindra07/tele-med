const express = require('express');
const authRoutes = require('./routes/authRoutes.js');
const patientRoutes = require('./routes/patientRoutes.js');
const doctorRoutes = require('./routes/doctorRoutes.js');
const symptomRouter = require('./routes/symptomRoutes.js')
const protect = require('./middleware/authMiddleware.js');
const notFoundMiddleware = require('./middleware/routeNotFound.js')
const appointmentRoutes = require("./routes/appointmentRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const logger = require('./middleware/logger.js');

const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));
app.use(logger);
//routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);

app.use('/api/symptoms',symptomRouter);

app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);

app.get('/',(req,res)=>{
    res.send("API Running ");
})



app.use(notFoundMiddleware);

module.exports = app;
