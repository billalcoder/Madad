import { sanitizeObject } from "./sanitaization.js";

// utils/updateHelper.js
export const updateUserOrProvider = async (req, res, model, allowedFields = []) => {
  try {
    const data = sanitizeObject(req.body);
    const user = req.user;
    
    // pick only allowed fields
    const updates = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }

    const updatedDoc = await model.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password"); // remove sensitive fields

    if (!updatedDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedDoc,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
