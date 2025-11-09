import express from "express";
import { getAllProvider, getNearbyProviders, getProvider, providerbasicRegisteration, providerLogin, providerLogout, updateproviderData } from "../controller/providerController.js";
import { finduser } from "../middleware/sessionMiddleware.js";

const router = express.Router();

router.get("/getuser", finduser, getAllProvider)

router.get("/get/:id", finduser, getProvider)

router.get("/nearprovider", finduser, getNearbyProviders)

router.post("/basicregister", providerbasicRegisteration)

router.put("/update", finduser, updateproviderData)

router.post("/login", providerLogin)

router.post("/logout", finduser, providerLogout)

export default router;