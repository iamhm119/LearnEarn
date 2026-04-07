import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

/**
 * Custom hook for Socket.IO connection in live events.
 * Manages connection lifecycle, event room joining, and real-time data.
 */
export function useSocket(eventId) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeParticipants, setActiveParticipants] = useState(0);
  const [timerData, setTimerData] = useState(null);
  const [tabWarning, setTabWarning] = useState(null);
  const [disqualified, setDisqualified] = useState(false);

  // Connect and join event
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !eventId) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_event", eventId);
      socket.emit("request_timer", eventId);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("leaderboard_update", (data) => {
      setLeaderboard(data);
    });

    socket.on("participant_update", (data) => {
      setActiveParticipants(data.activeParticipants || 0);
    });

    socket.on("timer_sync", (data) => {
      setTimerData(data);
    });

    socket.on("tab_switch_warning", (data) => {
      setTabWarning(data);
    });

    socket.on("disqualified", (data) => {
      setDisqualified(true);
    });

    socket.on("error", (data) => {
      console.error("[Socket] Error:", data.message);
    });

    return () => {
      socket.emit("leave_event", eventId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [eventId]);

  // Notify server of a submission (triggers leaderboard update broadcast)
  const emitSubmission = useCallback((data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("submit_solution", { eventId, ...data });
    }
  }, [eventId]);

  // Report tab switch
  const emitTabSwitch = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("tab_switch", { eventId });
    }
  }, [eventId]);

  // Request timer sync
  const requestTimerSync = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("request_timer", eventId);
    }
  }, [eventId]);

  return {
    connected,
    leaderboard,
    activeParticipants,
    timerData,
    tabWarning,
    disqualified,
    emitSubmission,
    emitTabSwitch,
    requestTimerSync,
  };
}
