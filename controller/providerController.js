
import { providerBasicValidation } from "../validator/providerBasicValidation.js";
import { providerModel } from "../Model/providerBasicScheme.js";
import { registration } from "../utils/ragistration.js";
import { login } from "../utils/login.js";
import { logoutService } from "../utils/logoutService.js";
import { updateUserOrProvider } from "../utils/update.Detailes.js";

export const getAllProvider = async (req, res) => {
    try {
        const providerData = await providerModel.find().select("-password -__v");

        if (!providerData.length) {
            return res.status(404).json({ message: "No providers found" });
        }

        res.status(200).json({ providerData });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch providers", error: error.message });
    }
};

export const providerbasicRegisteration = async (req, res, next) => {
    try {
        const result = await registration(req.body, providerModel, providerBasicValidation);
        return res.status(200).json({ message: "Provider registration successful", provider: result });
    } catch (error) {
        next(error);
    }
};

export const providerLogin = async (req, res, next) => {
    try {
        const result = await login(req.body, providerModel, "providermodel");

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        // Set secure cookie
        res.cookie("sid", result.sessionId, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            signed: true,
            maxAge: 1000 * 60 * 60 * 24 * 90,
        });

        res.status(200).json({
            success: true,
            message: result.message,
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
}

export const updateproviderData = async (req, res, next) => {
    updateUserOrProvider(req, res, providerModel, ["email", "name" , "phone"])
}

export const providerLogout = async (req, res) => {
    const result = await logoutService(req.user, req.session, res);

    if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, message: result.message });
}

export const getNearbyProviders = async (req, res) => {
    try {
        const { lat, lng, maxDistance = 50000, category } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        // Convert strings to numbers
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const distance = parseInt(maxDistance);

        // 🧭 $geoNear must be first stage in aggregation pipeline
        const pipeline = [
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    distanceField: "distance", // 👈 MongoDB will automatically calculate distance (in meters)
                    spherical: true,
                    maxDistance: distance, // optional limit
                },
            },
            {
                $addFields: {
                    distanceInKm: { $divide: ["$distance", 1000] }, // convert meters → km
                },
            },
            {
                $project: {
                    name: 1,
                    category: 1,
                    active: 1,
                    averageRating: 1,
                    location: 1,
                    distance: 1,
                    distanceInKm: { $round: ["$distanceInKm", 2] }, // round to 2 decimals
                },
            },
            { $sort: { distance: 1 } }, // sort by nearest first
        ];

        // Optional category filter
        if (category) {
            pipeline.splice(1, 0, { $match: { category } });
        }

        const providers = await providerModel.aggregate(pipeline);

        res.json({
            count: providers.length,
            providers,
        });
    } catch (error) {
        console.error("Error fetching nearby providers:", error);
        res.status(500).json({ message: "Error fetching nearby providers", error: error.message });
    }
};

