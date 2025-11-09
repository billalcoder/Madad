import express from "express";
import {
    createBooking,
    getAllBookings,
    getBookingsByUser,
    getBookingsByProvider,
    updateBookingStatus,
    deleteBooking
} from "../controller/bookingController.js";
import { finduser } from "../middleware/sessionMiddleware.js";

const router = express.Router();

// CRUD endpoints
router.post("/",finduser, createBooking);
router.get("/",finduser, getAllBookings);
router.get("/user/",finduser, getBookingsByUser);
router.get("/provider/",finduser, getBookingsByProvider);
router.patch("/:bookingId/status",finduser, updateBookingStatus);
router.delete("/:deleteId", deleteBooking);

export default router;