import mongoose from "mongoose"

try {
    await mongoose.connect(process.env.MONGOURL)
    console.log("Database connected successfully");
} catch (error) {
    console.log("failed to connect with database");
}