import "./DB/db.js";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import userRoute from "./Routes/userRoute.js";
import providerRoute from "./Routes/providerRoute.js";
import reviewRoute from "./Routes/reviewRoute.js";
import bookingRoute from "./Routes/bookingRoute.js";
import { sanitizeRequest } from "./middleware/sanitizeMiddleware.js";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler.js";
import { handleSocketConnection } from "./socket/providerSocket.js";
import { authLimit } from "./utils/rateLimiter.js"
import { finduser } from "./middleware/sessionMiddleware.js";

const app = express();
const server = http.createServer(app);

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.WEBURL || "http://localhost:5173",
    credentials: true
  }
});

// ✅ Middleware setup
app.use(helmet());
app.use(cors({ origin: process.env.WEBURL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser("!@#$%^&*()!!"));
app.use(sanitizeRequest);

// ✅ Routes
app.use("/user", userRoute);
app.use("/provider", providerRoute);
app.use("/booking", bookingRoute);
app.use("/review", reviewRoute);

// ✅ Error handler
app.use(errorHandler);

// ✅ Socket.IO live connection handler
io.on("connection", (socket) => {
  console.log("Provider connected:", socket.id);
  handleSocketConnection(socket, io);
});

// ✅ Server listen
server.listen(4000, (err) => {
  if (!err) console.log("✅ Server & Socket.IO running on port 4000");
  else console.log("❌ Something went wrong:", err);
});
