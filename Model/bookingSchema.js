import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "providermodel" },
    status: {
      type: String,
      enum: ["Requested", "Accepted", "in-progress", "completed", "cancelled"],
      default: "Requested",
    },

    // TTL fields
    requestedExpiresAt: { type: Date, default: null },
    acceptedExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

/**
 * 🔹 TTL indexes:
 * - requestedExpiresAt: deletes "Requested" bookings after 5 mins
 * - acceptedExpiresAt: deletes "Accepted" bookings after 5 mins
 */
bookingSchema.index({ requestedExpiresAt: 1 }, { expireAfterSeconds: 0 });
bookingSchema.index({ acceptedExpiresAt: 1 }, { expireAfterSeconds: 0 });

export const bookingModel = mongoose.model("bookingModel", bookingSchema);
