import { sessionModel } from "../Model/sessionModel.js";

export async function logoutService(user, sessionId, res) {
    try {
        if (!user) {
            return { success: false, message: "User not found" };
        }

        if (!sessionId) {
            return { success: false, message: "Invalid or expired session" };
        }


        user.islogin = false;
        await user.save();


        await sessionModel.findByIdAndDelete(sessionId);


        res.clearCookie("sid", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return { success: true, message: "Logout successful" };
    } catch (error) {
        console.error("❌ Logout error:", error);
        return { success: false, message: "Failed to logout" };
    }
}
