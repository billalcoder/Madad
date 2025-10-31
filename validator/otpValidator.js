import { z } from "zod/v3";

export const sendOtpSchema = z.object({
    email: z.string().email("Invalid email format"),
});

export const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});