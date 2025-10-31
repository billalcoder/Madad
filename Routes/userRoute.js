import express from "express";
import { getAllUser, GoogleLogin, sendOtp, updateUserData, userLogin, userLogout, userRegisteration, varifyOtp } from "../controller/userController.js";
import { finduser } from "../middleware/sessionMiddleware.js";

const router = express.Router();

router.get("/getuser", getAllUser)

router.post("/register", userRegisteration)

router.post("/login", userLogin)

router.put("/update" ,finduser,updateUserData )

router.post("/google-login", GoogleLogin);

router.post("/sendOtp", sendOtp)

router.post("/varifyOtp", varifyOtp)

router.post("/logout", finduser, userLogout)


export default router;