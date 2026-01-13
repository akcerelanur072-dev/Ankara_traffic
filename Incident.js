const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500 },
    category: {
      type: String,
      enum: ["traffic", "security", "maintenance", "other"],
      default: "other"
    },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        validate: {
          validator: (arr) => Array.isArray(arr) && arr.length === 2,
          message: "coordinates must be [lng, lat]"
        }
      }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

IncidentSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Incident", IncidentSchema);
