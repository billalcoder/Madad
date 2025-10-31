
import { bookingModel } from "../Model/bookingSchema.js";
import { bookingvalidation } from "../validator/bookingvalidation.js";
import { handleResponse } from "../utils/responseHandler.js";

/**
 * ✅ Create a new booking (secure + session-aware)
 */
export const createBooking = async (req, res, next) => {
  try {
    const { user, userType } = req;

    if (userType !== "userModel") {
      return handleResponse(res, 403, "Only users can create bookings");
    }

    // Validate and merge user info
    const validatedData = bookingvalidation.parse({
      ...req.body,
      userId: user._id.toString(),
    });

    // Prevent duplicate or active booking
    const existingBooking = await bookingModel.findOne({
      userId: user._id,
      providerId: validatedData.providerId,
      status: { $in: ["Requested", "Accepted", "in-progress"] },
    });

    if (existingBooking) {
      return handleResponse(res, 400, "Booking already exists or is active.");
    }

    // Create new booking
    const newBooking = await bookingModel.create({
      userId: user._id,
      providerId: validatedData.providerId,
      status: validatedData.status || "Requested",
    });

    // Populate for cleaner response
    const populatedBooking = await bookingModel
      .findById(newBooking._id)
      .populate("userId", "name email")
      .populate("providerId", "name category");

    return handleResponse(res, 201, "Booking created successfully!", {
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
    if (userType === "userModel" && booking.userId.toString() !== user._id.toString()) {
      return handleResponse(res, 403, "You are not allowed to modify this booking");
    }

    if (userType === "Provider" && booking.providerId.toString() !== user._id.toString()) {
      return handleResponse(res, 403, "You are not allowed to update this booking");
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await booking.populate([
      { path: "userId", select: "name email" },
      { path: "providerId", select: "name category" },
    ]);

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
