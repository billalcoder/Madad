import { model, Schema } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true , unique : true},
    password: { type: String, required: true },
    terms: { type: Boolean, default: false },
    islogin: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
})

export const usersessionModel = model("userModel", userSchema)