import { model, Schema } from "mongoose";

const providerBasicSchema = new Schema({
  name: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
    match: /^[0-9]{10}$/,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  title: { type: String },
  category: {
    type: String,
    required: true,
    enum: ["plumber", "electrician", "painter", "carpenter"],
  },
  description: { type: String },
  active: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  Terms: { type: Boolean, default: false },
  isLogin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },

  // ✅ GeoJSON location for live tracking
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  updatedAt: { type: Date, default: Date.now },
});

providerBasicSchema.index({ location: "2dsphere" });

export const providerModel = model("providermodel", providerBasicSchema);
