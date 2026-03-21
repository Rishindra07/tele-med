const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        specialization: {
            type: String,
            required: true
        },

        appointmentDate: {
            type: Date,
            required: true
        },

        timeSlot: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Scheduled", "Completed", "Cancelled"],
            default: "Scheduled"
        },

        reminders: {
            email24hSentAt: {
                type: Date,
                default: null
            },
            email1hSentAt: {
                type: Date,
                default: null
            }
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("Consultation", consultationSchema);

