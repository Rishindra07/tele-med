const express = require('express');
const userRoutes =  require('./routes/userRoutes.js')
const protect = require('./middleware/authMiddleware.js');
const app = express();

app.use(express.json());

//routes
app.use('/api/users',userRoutes);

app.get('/',(req,res)=>{
    res.send("API Running ");
})

module.exports = app;
