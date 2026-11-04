const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    capacity: {
      type: Number,
      required: true,
      min: 1
    },

    registeredCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

eventSchema.index({ startDate: 1 });

module.exports = mongoose.model("Event", eventSchema);