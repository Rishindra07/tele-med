const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["appointment", "prescription", "follow_up", "system", "pharmacy"],
      default: "appointment",
      index: true
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

notificationSchema.pre("save", function syncReadAt() {
  if (this.read && !this.readAt) {
    this.readAt = new Date();
  }

  if (!this.read) {
    this.readAt = null;
  }
});

const applyReadTimestampUpdate = function applyReadTimestampUpdate(next) {
  const update = this.getUpdate() || {};
  const nextSet = {
    ...(update.$set || {})
  };

  if (update.read === true || nextSet.read === true) {
    nextSet.readAt = new Date();
  }

  if (update.read === false || nextSet.read === false) {
    nextSet.readAt = null;
  }

  this.setUpdate({
    ...update,
    $set: nextSet
  });

  next();
};

notificationSchema.pre("findOneAndUpdate", applyReadTimestampUpdate);
notificationSchema.pre("updateMany", applyReadTimestampUpdate);

module.exports = mongoose.model("Notification", notificationSchema);
