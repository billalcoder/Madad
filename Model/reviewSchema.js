import { model, Schema } from "mongoose";

const reviewSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "bookingModel" },
    userId: { type: Schema.Types.ObjectId, ref: "userModel" },
    providerId: { type: Schema.Types.ObjectId, ref: "providermodel" },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
})

reviewSchema.index({ providerId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ bookingId: 1 });

export const reviewModel = model("reviewModel", reviewSchema) 