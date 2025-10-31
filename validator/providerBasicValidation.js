import z from "zod/v3";

export const providerBasicValidation = z.object({
    name: z.string().trim(),
    phone: z.string().trim().min(10, "Phone number must be 10 digits").max(10, "Phone number must be 10 digits").refine((val) => /^[0-9]{10}$/.test(val), {
        message: "Phone number must contain only digits",
    }),
    email: z.string().trim().email("Invalid email format"),
    password: z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters long")
        .refine(
            (val) =>
                /[A-Z]/.test(val) && // at least one uppercase letter
                /[a-z]/.test(val) && // at least one lowercase letter
                /[0-9]/.test(val) && // at least one digit
                /[@$!%*?&#]/.test(val), // at least one special character
            {
                message:
                    "Password must include uppercase, lowercase, number, and special character",
            }
        ),
    title: z.string().trim(),
    category: z.enum(["plumber", "electrician", "painter", "carpenter"]),
    description: z.string().max(500).optional(),
    active: z.boolean().default(false).optional(),
    terms: z.boolean().default(false)
})
