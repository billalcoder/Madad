import express from "express";
import { finduser } from "../middleware/sessionMiddleware.js";
import {
    createReview,
    getReviewsByProvider,
    getMyReviews,
} from "../controller/reviewController.js";

const router = express.Router();

// ✅ User creates review for completed booking
router.post("/", finduser, createReview);

// ✅ Get reviews for a specific provider (public)
router.get("/provider/:providerId", getReviewsByProvider);

// ✅ Get logged-in user's reviews 
router.get("/", finduser, getMyReviews);

export default router;
