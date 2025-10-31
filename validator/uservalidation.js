import { z } from "zod/v3";

export const userValidation = z.object({
    name: z.string().trim().min(3, "Name must be at least 3 characters long"),

    email: z
        .string() 
        .trim()
        .email("Invalid email format")
        .trim()
        .min(5, "Email must be at least 5 characters long"),

    password: z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters long")
        .refine(
            (val) =>
                /[A-Z]/.test(val) && // at least one uppercase
                /[a-z]/.test(val) && // at least one lowercase
                /[0-9]/.test(val) && // at least one number
                /[@$!%*?&#]/.test(val), // at least one special character
            {
                message:
                    "Password must include uppercase, lowercase, number, and special character",
            }
        ),
        terms : z.boolean().default(false)
});
