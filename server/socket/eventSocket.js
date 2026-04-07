const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const EventLeaderboard = require("../models/EventLeaderboard");
const EventRegistration = require("../models/EventRegistration");
const Event = require("../models/Event");

let io = null;

/**
 * Initialize Socket.IO on the existing HTTP server.
 * Called from server.js after the Express server starts.
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Auth middleware for Socket.IO ──────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userName = decoded.name || "Unknown";
      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  // ── Connection handler ────────────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`[Socket.IO] User connected: ${socket.userId}`);

    // ── JOIN EVENT ROOM ─────────────────────────────────────────────────
    socket.on("join_event", async (eventId) => {
      try {
        const registration = await EventRegistration.findOne({
          userId: socket.userId,
          eventId,
        });

        if (!registration) {
          socket.emit("error", { message: "Not registered for this event" });
          return;
        }

        socket.join(`event:${eventId}`);
        socket.eventId = eventId;

        // Get current participant count
        const roomSize = io.sockets.adapter.rooms.get(`event:${eventId}`)?.size || 0;

        // Notify room
        io.to(`event:${eventId}`).emit("participant_update", {
          activeParticipants: roomSize,
          userId: socket.userId,
          userName: socket.userName,
          action: "joined",
        });

        // Send current leaderboard to the joining user
        const leaderboard = await getEventLeaderboardData(eventId);
        socket.emit("leaderboard_update", leaderboard);

        console.log(`[Socket.IO] ${socket.userName} joined event ${eventId}`);
      } catch (err) {
        console.error("[Socket.IO] join_event error:", err.message);
        socket.emit("error", { message: "Failed to join event" });
      }
    });

    // ── LEAVE EVENT ─────────────────────────────────────────────────────
    socket.on("leave_event", (eventId) => {
      socket.leave(`event:${eventId}`);
      const roomSize = io.sockets.adapter.rooms.get(`event:${eventId}`)?.size || 0;
      io.to(`event:${eventId}`).emit("participant_update", {
        activeParticipants: roomSize,
        userId: socket.userId,
        userName: socket.userName,
        action: "left",
      });
    });

    // ── SUBMIT SOLUTION (triggers leaderboard update) ───────────────────
    socket.on("submit_solution", async (data) => {
      try {
        const { eventId } = data;
        if (!eventId) return;

        // Broadcast updated leaderboard to all participants
        const leaderboard = await getEventLeaderboardData(eventId);
        io.to(`event:${eventId}`).emit("leaderboard_update", leaderboard);
      } catch (err) {
        console.error("[Socket.IO] submit_solution error:", err.message);
      }
    });

    // ── TAB SWITCH (anti-cheat) ─────────────────────────────────────────
    socket.on("tab_switch", async (data) => {
      try {
        const { eventId } = data;
        if (!eventId) return;

        const registration = await EventRegistration.findOne({
          userId: socket.userId,
          eventId,
        });

        if (registration) {
          registration.tabSwitchCount += 1;
          await registration.save();

          const event = await Event.findById(eventId);
          if (event && registration.tabSwitchCount >= event.tabSwitchLimit) {
            registration.status = "disqualified";
            await registration.save();
            socket.emit("disqualified", {
              message: "You have been disqualified for excessive tab switching",
            });
          } else {
            socket.emit("tab_switch_warning", {
              count: registration.tabSwitchCount,
              limit: event?.tabSwitchLimit || 3,
              remaining: (event?.tabSwitchLimit || 3) - registration.tabSwitchCount,
            });
          }
        }
      } catch (err) {
        console.error("[Socket.IO] tab_switch error:", err.message);
      }
    });

    // ── TIMER SYNC ──────────────────────────────────────────────────────
    socket.on("request_timer", async (eventId) => {
      try {
        const event = await Event.findById(eventId).select("startTime duration").lean();
        if (event) {
          const endTime = new Date(event.startTime).getTime() + event.duration * 60000;
          const remaining = Math.max(0, endTime - Date.now());
          socket.emit("timer_sync", {
            remaining: Math.floor(remaining / 1000),
            endTime,
            serverTime: Date.now(),
          });
        }
      } catch (err) {
        console.error("[Socket.IO] timer sync error:", err.message);
      }
    });

    // ── DISCONNECT ──────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      if (socket.eventId) {
        const roomSize =
          io.sockets.adapter.rooms.get(`event:${socket.eventId}`)?.size || 0;
        io.to(`event:${socket.eventId}`).emit("participant_update", {
          activeParticipants: roomSize,
          userId: socket.userId,
          action: "disconnected",
        });
      }
      console.log(`[Socket.IO] User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

/**
 * Get leaderboard data for an event (reused by socket events)
 */
async function getEventLeaderboardData(eventId) {
  const leaderboard = await EventLeaderboard.find({ eventId })
    .sort({ totalScore: -1, totalTimeTaken: 1 })
    .populate("userId", "name level")
    .limit(50)
    .lean();

  return leaderboard.map((entry, i) => ({
    userId: entry.userId?._id,
    userName: entry.userId?.name || "Unknown",
    userLevel: entry.userId?.level || "Beginner",
    userInitial: entry.userId?.name?.[0]?.toUpperCase() || "?",
    totalScore: entry.totalScore,
    correctAnswers: entry.correctAnswers,
    questionsAnswered: entry.questionsAnswered,
    totalTimeTaken: entry.totalTimeTaken,
    rank: i + 1,
    isSelected: entry.isSelected,
  }));
}

/**
 * Get the Socket.IO instance (for use in controllers)
 */
function getIO() {
  return io;
}

module.exports = { initSocket, getIO };
