const express = require('express');
const userRoutes =  require('./routes/userRoutes.js')
const symptomRouter = require('./routes/symptomRoutes.js')
const protect = require('./middleware/authMiddleware.js');
const notFoundMiddleware = require('./middleware/routeNotFound.js')
const appointmentRoutes = require("./routes/appointmentRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");

const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
//routes
app.use('/api/users',userRoutes);

app.use('/api/symptoms',symptomRouter);

app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);

app.get('/',(req,res)=>{
    res.send("API Running ");
})



app.use(notFoundMiddleware);

module.exports = app;
