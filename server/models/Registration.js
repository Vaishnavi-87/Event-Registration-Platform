const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    organization: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    domainInterests: {
      type: [String],
      required: true,
      validate: {
        validator: function (values) {
          return values.length > 0 &&
            values.every((value) =>
              [
                "Web Dev",
                "AI/ML",
                "Blockchain",
                "Cybersecurity",
                "Cloud",
                "Design"
              ].includes(value)
            );
        },
        message: "Select at least one valid domain interest."
      }
    },

    status: {
      type: String,
      enum: ["confirmed", "waitlisted", "cancelled"],
      default: "confirmed"
    }
  },
  {
    timestamps: true
  }
);

// Same email can register for different events,
// but only once for a particular event.
registrationSchema.index(
  { eventId: 1, email: 1 },
  { unique: true }
);

registrationSchema.index({ createdAt: -1 });

module.exports = mongoose.model(
  "Registration",
  registrationSchema
);