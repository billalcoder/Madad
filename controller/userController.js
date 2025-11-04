import { OAuth2Client } from "google-auth-library"
import { userValidation } from "../validator/uservalidation.js"
import { usersessionModel } from "../Model/userSchema.js"
import { sendOtpSchema, verifyOtpSchema } from "../validator/otpValidator.js"
import { OtpModel } from "../Model/otpModel.js"
import { sendOtpMail } from "../utils/otp.js"
import { sanitizeObject } from "../utils/sanitaization.js"
import { registration } from "../utils/ragistration.js"
import { login } from "../utils/login.js"
import { logoutService } from "../utils/logoutService.js"
import { sessionModel } from "../Model/sessionModel.js"
import { updateUserOrProvider } from "../utils/update.Detailes.js"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const getAllUser = async (req, res) => {
    try {
        const providerData = await usersessionModel.find().select("-password -__v");

        if (!providerData.length) {
            return res.status(404).json({ message: "No user found" });
        }

        res.status(200).json({ providerData });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch providers", error: error.message });
    }
}
export const getProfile = async (req, res) => {
    try {
        const { user } = req

        if (!user) {
            return res.status(404).json({ message: "No user found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch providers", error: error.message });
    }
}

export const userRegisteration = async (req, res, next) => {
    const body = req.body
    try {
        const { message, error } = await registration(body, usersessionModel, userValidation)
        if (!message) {
            return res.status(400).json({ error })
        }
        res.status(200).json({ message })
    } catch (error) {
        return next(error)
    }
}

export const userLogin = async (req, res, next) => {
    try {
        const result = await login(req.body, usersessionModel, "userModel");

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        // Set secure cookie
        res.cookie("sid", result.sessionId, {
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            signed: true,
            maxAge: 1000 * 60 * 60 * 24 * 90,
        });

        res.status(200).json({
            success: true,
            message: result.message,
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
}

export const updateUserData = async (req, res, next) => {
    updateUserOrProvider(req, res, usersessionModel, ["email", "name"])
}

export const GoogleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        // 1. Verify Google JWT
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        if (!ticket) return res.status(400).json({ error: "Token Invalid" })

        const { email, name } = ticket.getPayload();

        // 2. Find or create user
        let user = await usersessionModel.findOne({ email });
        if (!user) {
            user = usersessionModel.create({
                name,
                email: email.toLowerCase(),
                password: "",
                terms: true
            });

        }

        await sessionModel.findOneAndDelete({ userId: user._id })
        // 4. Create session
        const session = sessionModel.create({
            userId: user._id.toString(),
            userType: "userModel"
        });

        // 5. Set signed cookie
        res.cookie("sid", user._id.toString(), {
            httpOnly: true,
            sameSite: "lax",
            signed: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24
        });

        res.json({ message: "Login successful" });
    } catch (error) {
        res.status(400).json({ message: "Login failed", error: error.message });
    }
}

export const sendOtp = async (req, res) => {
    try {
        const cleanData = sanitizeObject(req.body)
        const result = sendOtpSchema.safeParse(cleanData);
        if (!result.success) return res.status(400).json({ err: result.error.errors });
        const data = result.data
        const email = data?.email
        if (!email) {
            return res.status(400).json({ error: "invalid email" })
        }
        else {
            const user = await usersessionModel.findOne({ email })
            if (!user) {
                return res.json({ error: "If the email is registered, OTP has been sent" })
            }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to DB (replace old OTP if exists)
        await OtpModel.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        // Send OTP mail
        await sendOtpMail(email, otp);

        return res.status(200).json({ message: "If the email is registered, OTP has been sent" });
    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        return res.status(500).json({ message: "Failed to send OTP" });
    }
}

export const varifyOtp = async (req, res) => {
    try {
        const cleanData = sanitizeObject(req.body)
        const result = verifyOtpSchema.safeParse(cleanData);
        if (!result.success) return res.status(400).json({ err: result.error.errors });
        const { email, otp } = result.data

        // Find OTP from DB
        const record = await OtpModel.findOne({ email });

        if (!record) {
            return res.status(400).json({ message: "OTP expired or not found" });
        }

        if (record.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // ✅ OTP is correct → delete from DB to prevent reuse
        await OtpModel.deleteOne({ email });

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        return res.status(500).json({ message: "Failed to verify OTP" });
    }
}

export const userLogout = async (req, res) => {
    const result = await logoutService(req.user, req.session, res);

    if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, message: result.message });
}