import bcrypt from "bcrypt"
import { sanitizeObject } from "../utils/sanitaization.js";

export async function registration(body, model, validator) {
    const cleanData = sanitizeObject(body)
    console.log(cleanData);
    const result = validator.safeParse(cleanData);
    if (!result.success) return { error: result.error.errors[0].message };
    const existing = await model.findOne({ email: result.data.email });
    if (existing) return { error: "Please try different email" }
    if (!result.data.terms) return { error: "Please checked the term and condition" }
    try {
        const hashPassword = await bcrypt.hash(result.data.password, 10)
        result.data.password = hashPassword
        await model.create(result.data)
        return { message: "Registration Done Successfully" }
    } catch (error) {
        if (error.code === 11000) return { error: "Please try different email" }
        return { error: "Problem from our side" }
    }
} 