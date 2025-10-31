import bcrypt from "bcrypt";
import { sanitizeObject } from "../utils/sanitaization.js";
import { loginValidation } from "../validator/loginValidation.js";
import { sessionModel } from "../Model/sessionModel.js";
import { session } from "./session.js"; // session creator helper

export async function login(body, model, userType) {
    const cleanData = sanitizeObject(body);
    const result = loginValidation.safeParse(cleanData);
    if (!result.success) return { success: false, error: result.error.errors };

    const { email, password } = result.data;

    const user = await model.findOne({ email });
    console.log(user);
    if (!user) return { success: false, error: "Invalid email or password" };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { success: false, error: "Invalid email or password" };

    // Remove old session if exists
    await sessionModel.findOneAndDelete({ userId: user._id });

    // Create new session
    const sessionId = await session(user, userType);

    // Update login status
    user.islogin = true;
    await user.save();

    return {
        success: true,
        message: "Login successful",
        sessionId,
        user: { name: user.name, email: user.email },
    };
}
