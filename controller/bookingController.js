import cron from "node-cron";

import { bookingModel } from "../Model/bookingSchema.js";
import { bookingvalidation } from "../validator/bookingvalidation.js";
import { handleResponse } from "../utils/responseHandler.js";
import { sendNotification } from "../utils/PushNotification.js";
import { usersessionModel } from "../Model/userSchema.js";

/**
 * ✅ Create a new booking (secure + session-aware)
 */
export const createBooking = async (req, res, next) => {
  try {
    const { user, userType } = req;
    if (userType !== "userModel")
      return handleResponse(res, 403, "Only users can create bookings");

    const validatedData = bookingvalidation.parse({
      ...req.body,
      userId: user._id.toString(),
    });

    const existingBooking = await bookingModel.findOne({
      userId: user._id,
      providerId: validatedData.providerId,
      status: { $in: ["Requested", "Accepted", "in-progress"] },
    });

    if (existingBooking)
      return handleResponse(res, 400, "Booking already exists or is active.");

    const newBooking = await bookingModel.create({
      userId: user._id,
      providerId: validatedData.providerId,
      status: "Requested",
      requestedExpiresAt: new Date(Date.now() + 2 * 60 * 1000), // 5 min TTL
    });

    const populatedBooking = await bookingModel
      .findById(newBooking._id)
      .populate("userId", "name email")
      .populate("providerId", "name category");

    return handleResponse(res, 201, "Booking created. Waiting for provider to accept.", {
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get all bookings (paginated, admin view)
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      bookingModel
        .find()
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .populate("providerId", "name category")
        .sort({ createdAt: -1 }),
      bookingModel.countDocuments(),
    ]);

    return handleResponse(res, 200, "Bookings fetched successfully", {
      total,
      page,
      limit,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Update booking status (with ownership & validation)
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const { user, userType } = req;

    const validStatuses = [
      "Requested",
      "Accepted",
      "cancelled",
      "completed",
      "in-progress",
    ];

    if (!validStatuses.includes(status)) {
      return handleResponse(res, 400, "Invalid booking status");
    }

    const booking = await bookingModel.findById(bookingId);
    if (!booking) return handleResponse(res, 404, "Booking not found");

    // Ownership check
    if (
      userType === "userModel" &&
      booking.userId.toString() !== user._id.toString()
    ) {
      return handleResponse(res, 403, "You are not allowed to modify this booking");
    }

    if (
      userType === "providermodel" &&
      booking.providerId.toString() !== user._id.toString()
    ) {
      return handleResponse(res, 403, "You are not allowed to update this booking");
    }

    booking.status = status;
    if (status === "Accepted") {
      booking.acceptedExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      booking.requestedExpiresAt = null; // clear old TTL
    }

    // 🔹 Clear TTLs when booking progresses or completes
    if (["in-progress", "completed", "cancelled"].includes(status)) {
      booking.acceptedExpiresAt = null;
      booking.requestedExpiresAt = null;
    }
    await booking.save();

    // ✅ Populate full booking details
    const updatedBooking = await booking.populate([
      { path: "userId", select: "name email playerId" },
      { path: "providerId", select: "name category" },
    ]);

    const token = updatedBooking.userId.playerId;

    // ✅ When provider ACCEPTS booking → Send notification + start timer
    if (userType === "providermodel" && status === "Accepted") {
      console.log("✅ Booking accepted by provider");

      try {
        // 🔔 Notify the user
        if (token) {
          await sendNotification(
            token,
            `Your booking request has been accepted by ${user.name || "the provider"}! ✅`,
            "Booking Accepted"
          );
          console.log("📩 Notification sent to:", updatedBooking.userId.name);
        } else {
          console.log("⚠️ No playerId found for the user.");
        }

      } catch (notifyErr) {
        console.error("❌ Error sending notification or starting timer:", notifyErr);
      }
    }

    return handleResponse(res, 200, "Booking updated successfully", {
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get bookings by logged-in user (paginated)
 */
export const getBookingsByUser = async (req, res, next) => {
  try {
    const { user } = req;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      bookingModel
        .find({ userId: user._id })
        .skip(skip)
        .limit(limit)
        .populate("providerId", "name category")
        .sort({ createdAt: -1 }),
      bookingModel.countDocuments({ userId: user._id }),
    ]);

    return handleResponse(res, 200, "Bookings fetched successfully", {
      total,
      page,
      limit,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get bookings by provider (paginated)
 */
export const getBookingsByProvider = async (req, res, next) => {
  try {
    const { user, userType } = req;

    if (userType !== "Provider") {
      return handleResponse(res, 403, "Only providers can view their bookings");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      bookingModel
        .find({ providerId: user._id })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .sort({ createdAt: -1 }),
      bookingModel.countDocuments({ providerId: user._id }),
    ]);

    return handleResponse(res, 200, "Bookings fetched successfully", {
      total,
      page,
      limit,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /:deleteId
export const deleteBooking = async (req, res) => {
  try {
    const { deleteId } = req.params;

    // 1️⃣ Check if booking exists
    const booking = await bookingModel
      .findById(deleteId)
      .populate("userId", "name playerId")
      .populate("providerId", "name");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 2️⃣ Mark booking as 'cancelled'
    booking.status = "cancelled";
    await booking.save();

    // 3️⃣ Notify the user (if playerId available)
    if (booking.userId?.playerId) {
      await sendNotification(
        booking.userId.playerId,
        `Your booking with ${booking.providerId?.name || "the provider"} was automatically cancelled because the provider did not respond in time.`,
        "Booking Cancelled"
      );
    }

    // 4️⃣ Respond success
    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      cancelledBooking: booking,
    });
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling booking",
      error: error.message,
    });
  }
};

