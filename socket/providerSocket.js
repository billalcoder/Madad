import { providerModel } from "../Model/providerBasicScheme.js";

export const handleSocketConnection = (socket, io) => {
  console.log("🔗 New provider socket connected:", socket.id);

  // ✅ Provider joins with their providerId
  socket.on("join_provider", async (providerId) => {
    socket.providerId = providerId;
    console.log(`✅ Provider ${providerId} joined socket room`);
  });

  // ✅ Receive live location updates from provider
  socket.on("update_location", async (data) => {
    try {

      const { providerId, lat, lng } = JSON.parse(data);
  
      if (!providerId || !lat || !lng) return;

      // Update location in DB
      const update = await providerModel.findByIdAndUpdate(providerId, {
        $set: {
          location: {
            type: "Point",
            coordinates: [lng, lat], // [longitude, latitude]
          },
          updatedAt: new Date(),
        },
      });

      // Broadcast new location to all users
      io.emit("provider_location_update", {
        providerId,
        lat,
        lng,
      });
    } catch (err) {
      console.error("❌ Error updating provider location:", err.message);
    }
  });

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Provider disconnected: ${socket.providerId}`);
  });
};
