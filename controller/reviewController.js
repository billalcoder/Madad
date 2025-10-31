

import { reviewModel } from "../Model/reviewSchema.js";
import { bookingModel } from "../Model/bookingSchema.js";
import { reviewValidation } from "../validator/reviewValidation.js";
import { providerModel } from "../Model/providerBasicScheme.js";
import { handleResponse } from "../utils/responseHandler.js";
import mongoose from "mongoose";

/**
 * ✅ Create Review (secure, validated, scalable)
 */
export const createReview = async (req, res, next) => {
  try {
    const user = req.user;

    // 1️⃣ Validate safely
    const validated = reviewValidation.safeParse({
      ...req.body,
      userId: user._id.toString(),
    });

    if (!validated.success) {
      return handleResponse(res, 400, "Validation failed", {
        errors: validated.error.issues.map((e) => e.message),
      });
    }

    const data = validated.data;

    // 2️⃣ Ensure booking belongs to this user and is completed
    const booking = await bookingModel.findOne({
      _id: data.bookingId,
      userId: user._id,
      status: "completed",
    });

    if (!booking) {
      return handleResponse(res, 400, "Booking not found or not completed yet");
    }

    // 3️⃣ Prevent duplicate review
    const existing = await reviewModel.findOne({
      bookingId: data.bookingId,
      userId: user._id,
    });

    if (existing) {
      return handleResponse(res, 400, "You already reviewed this booking");
    }

    // 4️⃣ Create review
    const review = await reviewModel.create({
      bookingId: data.bookingId,
      userId: user._id,
      providerId: data.providerId,
      rating: data.rating,
      comment: data.comment?.trim() || "",
    });

    // 5️⃣ Update provider's average rating efficiently using aggregation
    const [{ averageRating = 0 } = {}] = await reviewModel.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(data.providerId) } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);

    await providerModel.findByIdAndUpdate(data.providerId, {
      averageRating: Number(averageRating.toFixed(1)),
    });

    // 6️⃣ Populate for clean response
    const populatedReview = await reviewModel
      .findById(review._id)
      .populate("userId", "name email")
      .populate("providerId", "name category averageRating");

    return handleResponse(res, 201, "Review created successfully", {
      averageRating: averageRating.toFixed(1),
      review: populatedReview,
    });
  } catch (error) {
    console.error("❌ Error creating review:", error);
    next(error);
  }
};

/**
 * ✅ Get Reviews by Provider (paginated + sorted)
 */
export const getReviewsByProvider = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return handleResponse(res, 400, "Invalid provider ID");
    }

    const [reviews, total] = await Promise.all([
      reviewModel
        .find({ providerId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("userId", "name email")
        .populate("bookingId", "status createdAt"),
      reviewModel.countDocuments({ providerId }),
    ]);

    return handleResponse(res, 200, "Provider reviews fetched successfully", {
      total,
      page,
      limit,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get Reviews by Logged-in User (paginated)
 */
export const getMyReviews = async (req, res, next) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      reviewModel
        .find({ userId: user._id })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("providerId", "businessName category averageRating"),
      reviewModel.countDocuments({ userId: user._id }),
    ]);

    return handleResponse(res, 200, "Your reviews fetched successfully", {
      total,
      page,
      limit,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};
