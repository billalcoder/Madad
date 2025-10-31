import express from "express";
import { getAllProvider, getNearbyProviders, providerbasicRegisteration, providerLogin, providerLogout } from "../controller/providerController.js";
import { finduser } from "../middleware/sessionMiddleware.js";

const router = express.Router();

router.get("/getuser", getAllProvider)

router.post("/basicregister", providerbasicRegisteration)

router.post("/nearprovider" , getNearbyProviders)

router.post("/login", providerLogin)

router.post("/logout", finduser, providerLogout)

export default router;