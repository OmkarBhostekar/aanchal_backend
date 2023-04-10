const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child",
  },
  deviceType: {
    type: String,
    enum: ["web", "app"],
    default: "web",
  },
  devicePushToken: String,
  deviceUniqueId: {
    type: String,
    required: true,
  },
  apps: [
    {
      appName: {
        type: String,
        required: true,
      },
      packageName: {
        type: String,
        required: true,
      },
      isLocked: {
        type: Boolean,
        default: false
      },
    },
  ],
  websites: [
    {
      url: {
        type: String,
        required: true,
      },
      isBlocked: {
        type: Boolean,
        required: false,
      },
    },
  ],
  bedtime: {
    type: String,
    default: "00:00",
  },
  screentime: [
    {
      appName: String,
      timeInMinutes: Number,
    },
  ],
  lastLocation: {
    lat: Number,
    long: Number,
  },
});

module.exports = mongoose.model("Device", childSchema);
