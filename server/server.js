const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorMiddleware");
const validateInput = require("./middleware/validateInput");
const { initSocket } = require("./socket/eventSocket");

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "PORT"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    logger.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
});

const app = express();

// Security & Parsing Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(validateInput);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const quizRoutes = require("./routes/quizRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const learningPathRoutes = require("./routes/learningPathRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const storeRoutes = require("./routes/storeRoutes");
const eventRoutes = require("./routes/eventRoutes");

// ── API Endpoints ────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/learning-paths", learningPathRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/events", eventRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Root
app.get("/", (req, res) => {
  res.json({ message: "Learn & Earn API — AWS Skill Builder Edition 🚀" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found", path: req.path });
});

// Global error handler
app.use(errorHandler);

// ── MongoDB Connection ───────────────────────────────────────────────────────
const connectMongoDB = async (retries = 5) => {
  while (retries > 0) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        family: 4, // Force IPv4
      });
      logger.info("MongoDB connected successfully");
      return;
    } catch (err) {
      retries--;
      logger.warn(`MongoDB connection failed. Retries left: ${retries}`, { error: err.message });
      if (retries > 0) await new Promise((r) => setTimeout(r, 2000));
    }
  }
  logger.error("Failed to connect to MongoDB after retries");
  process.exit(1);
};

connectMongoDB();

mongoose.connection.on("connected", () => logger.info("Mongoose connected to MongoDB"));
mongoose.connection.on("error", (err) => logger.error("Mongoose connection error", err));
mongoose.connection.on("disconnected", () => logger.warn("Mongoose disconnected"));

// ── Server Start + Socket.IO ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Initialize Socket.IO on the HTTP server
const io = initSocket(httpServer);
logger.info("Socket.IO initialized for live events");

const server = httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  logger.info(`Socket.IO ready for real-time connections`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });
});

module.exports = app;