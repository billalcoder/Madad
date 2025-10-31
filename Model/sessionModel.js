import { model, Schema } from "mongoose";

const sessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, refPath: "userType" },
    userType: { type: String, required: true, enum: ['userModel', 'providermodel'] },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 }
})

export const sessionModel = model("sessionModel", sessionSchema) 