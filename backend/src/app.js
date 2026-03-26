const express = require('express');
const authRoutes = require('./routes/authRoutes.js');
const patientRoutes = require('./routes/patientRoutes.js');
const doctorRoutes = require('./routes/doctorRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const pharmacyRoutes = require('./routes/pharmacyRoutes.js');
const symptomRouter = require('./routes/symptomRoutes.js')
const protect = require('./middleware/authMiddleware.js');
const notFoundMiddleware = require('./middleware/routeNotFound.js')
const appointmentRoutes = require("./routes/appointmentRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const logger = require('./middleware/logger.js');

const cors = require('cors');
const app = express();

const path = require('path');
const upload = require('./middleware/uploadMiddleware.js');

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

app.post('/api/upload', protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, fileUrl });
});

app.use(logger);
//routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pharmacy', pharmacyRoutes);

app.use('/api/symptoms',symptomRouter);

app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);

app.get('/',(req,res)=>{
    res.send("API Running ");
})



app.use(notFoundMiddleware);

module.exports = app;
