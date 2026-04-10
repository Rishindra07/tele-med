const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    email24hSentAt: {
      type: Date,
      default: null
    },
    email1hSentAt: {
      type: Date,
      default: null
    },
    pushSentAt: {
      type: Date,
      default: null
    },
    followUp3dSentAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const consultationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    specialization: {
      type: String,
      required: true,
      trim: true
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "FollowUp"],
      default: "Scheduled",
      index: true
    },
    consultationMode: {
      type: String,
      enum: ["video", "audio", "chat", "in_person"],
      default: "video"
    },
    reasonForVisit: {
      type: String,
      trim: true,
      default: null
    },
    symptoms: {
      type: [String],
      default: []
    },
    meetingLink: {
      type: String,
      trim: true,
      default: null
    },
    consultationNotes: {
      type: String,
      trim: true,
      default: null
    },
    followUpDate: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: null
    },
    reminders: {
      type: reminderSchema,
      default: () => ({})
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending"
    },
    paymentMethod: {
      type: String,
      default: "Online"
    },
    consultationFee: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    },
    rescheduledByDoctor: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

consultationSchema.index({ patient: 1, appointmentDate: -1 });
consultationSchema.index({ doctor: 1, appointmentDate: -1 });
consultationSchema.index({ doctor: 1, appointmentDate: 1, timeSlot: 1, status: 1 });

consultationSchema.virtual("isUpcoming").get(function getIsUpcoming() {
  return this.status === "Scheduled" && this.appointmentDate >= new Date();
});

consultationSchema.pre("save", function syncStatusTimestamps() {
  if (this.status === "Cancelled" && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }

  if (this.status !== "Cancelled") {
    this.cancelledAt = null;
  }
});

module.exports = mongoose.model("Consultation", consultationSchema);
