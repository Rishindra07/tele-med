const MedicalRecord = require('../models/HealthRecord');

exports.getMyRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find({ patient: req.user._id })
            .populate('doctor', 'full_name email')
            .populate('consultation')
            .populate('prescription')
            .sort({ date: -1 });

        res.json({
            success: true,
            records
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch medical records" });
    }
};

exports.addRecord = async (req, res) => {
    try {
        const { type, title, description, fileUrl, date } = req.body;
        
        const record = await MedicalRecord.create({
            patient: req.user._id,
            type,
            title,
            description,
            fileUrl,
            date: date || new Date()
        });

        res.status(201).json({
            success: true,
            record
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to add medical record" });
    }
};

exports.deleteRecord = async (req, res) => {
    try {
        const result = await MedicalRecord.findOneAndDelete({
            _id: req.params.id,
            patient: req.user._id
        });

        if (!result) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.json({
            success: true,
            message: "Record deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete medical record" });
    }
};

exports.getPatientHistory = async (req, res) => {
    try {
        const { id: patientId } = req.params;
        const records = await MedicalRecord.find({ patient: patientId })
            .populate('doctor', 'full_name email')
            .populate('consultation')
            .populate('prescription')
            .sort({ date: -1 });

        res.json({
            success: true,
            records
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch patient history" });
    }
};