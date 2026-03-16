const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  date: Date,

  slots: [String] // ["10:00", "10:30", "11:00"]
});

module.exports = mongoose.model("DoctorAvailability", availabilitySchema);