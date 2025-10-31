import { sessionModel } from "../Model/sessionModel.js"

export async function finduser(req, res, next) {
    try {
        const session = req.signedCookies.sid
        if (!session) return res.status(404).json({ error: "session not found" })
            const user = await sessionModel.findOne({ _id: session }).populate("userId")
        if (!user) {
            return res.status(404).json({ error: "Invalid session" });
        }
        req.session = session
        req.user = user.userId
        req.userType = user.userType
        next()
    } catch (error) {
        console.error("Error in finduser middleware:", error);
        return res.status(500).json({ error: "Server error" });
    }
}