const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['prescription', 'lab_report', 'note', 'imaging', 'vaccine'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    fileUrl: String,
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
