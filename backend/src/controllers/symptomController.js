const axios = require("axios");
const SymptomLog = require('../models/SymptomLog.js');
const getDiagnosis = require('../services/aiService.js')
const checkSymptoms = async (req, res) => {
  try {
    let { symptoms } = req.body;

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Symptoms must be a non-empty array"
      });
    }

    const aiResponse = await getDiagnosis(symptoms);
    const aiResult = aiResponse.data;

    await SymptomLog.create({
      patient: req.user._id,
      symptoms,
      predictedConditions: aiResult.conditions,
      severity: aiResult.severity,
      advice: aiResult.advice,
      aiSource: aiResponse.source
    });

    return res.status(200).json({
      success: true,
      aiUsed: aiResponse.source,
      prediction: aiResult,
      immediateConsult: aiResult.severity === "high"
    });

  } catch (error) {
    console.error("SYMPTOM ERROR:", error);
    if (error.message === "ALL_AI_FAILED") {
      return res.status(503).json({
        success: false,
        message: "AI diagnosis services unavailable. Try later."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = checkSymptoms;