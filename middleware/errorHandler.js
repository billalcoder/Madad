export function errorHandler(err, req, res, next) {
    console.error("❌ Error:", err);

    const status = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (err.name === "ZodError") {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: err.errors.map(e => e.message)
        });
    }

    return res.status(status).json({
        success: false,
        message,
    });
}
