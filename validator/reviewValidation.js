import { z } from "zod/v3";
import mongoose from "mongoose";


export const reviewValidation = z.object({
  bookingId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "enter a valid bookingID"),
  userId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "enter a valid userID"),
  providerId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "enter a valid provideID"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z.string().max(500, "charecter should be less then 500").optional(),
});
