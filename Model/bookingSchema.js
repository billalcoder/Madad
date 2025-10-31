import { model, Schema } from "mongoose";

const bookingSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "userModel" },
    providerId: { type: Schema.Types.ObjectId, ref: "providermodel" },
    status: {
        type: String,
        enum: ["Requested", "Accepted", "cancelled", "completed", "in-progress"]
    },
    createdAt: { type: Date, default: Date.now }
})

bookingSchema.index({ userId: 1, providerId: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

export const bookingModel = model("bookingModel", bookingSchema)