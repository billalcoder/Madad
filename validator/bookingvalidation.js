import z from "zod/v3";
import mongoose from "mongoose";

export const bookingvalidation = z.object({
    userId : z.string().trim().refine((val) => mongoose.Types.ObjectId.isValid(val) , "Please enter the valid user ID").optional(),
    providerId : z.string().trim().refine((val) => mongoose.Types.ObjectId.isValid(val) , "Please enter the valid provider ID"),
    status : z.enum(["Requested", "Accepted", "cancelled", "completed", "in-progress"])
})