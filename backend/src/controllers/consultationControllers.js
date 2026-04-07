const Consultation = require("../models/Consultation.js");

const finishConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration } = req.body;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: "Consultation not found." });
    }

    consultation.status = "Completed";
    if (duration !== undefined) {
      consultation.duration = duration;
    }

    await consultation.save();

    res.status(200).json({ 
      success: true, 
      message: "Consultation finished successfully.", 
      consultation 
    });
  } catch (error) {
    console.error("Error ending consultation:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  finishConsultation
};
