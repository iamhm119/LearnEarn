import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Auto-inject JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);
export const verifyToken = () => API.get("/auth/verify");

// Learning Paths
export const getLearningPaths = () => API.get("/learning-paths");
export const getLearningPath = (id) => API.get(`/learning-paths/${id}`);
export const enrollInPath = (id) => API.post(`/learning-paths/${id}/enroll`);
export const getPathProgress = (id) => API.get(`/learning-paths/${id}/progress`);

// Courses
export const getCourses = () => API.get("/courses");
export const getCourse = (id) => API.get(`/courses/${id}`);

// Modules
export const getModulesByCourse = (courseId) => API.get(`/modules/course/${courseId}`);
export const getModule = (id) => API.get(`/modules/${id}`);

// Quiz
export const getQuiz = (moduleId) => API.get(`/quiz/${moduleId}`);
export const submitQuiz = (data) => API.post("/quiz/submit", data);

// Analytics
export const getAnalytics = () => API.get("/analytics");

// Leaderboard
export const getLeaderboard = () => API.get("/leaderboard");

// Certificates
export const getUserCertificates = () => API.get("/certificates/user");
export const generateCertificate = (courseId) => API.post(`/certificates/generate/${courseId}`);
export const purchaseItem = (data) => API.post("/store/purchase", data);
export const equipItem = (data) => API.post("/store/equip", data);

// Events (Live Competitions)
export const getEvents = () => API.get("/events");
export const getEvent = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post("/events", data);
export const registerForEvent = (id) => API.post(`/events/${id}/register`);
export const submitEventAnswer = (id, data) => API.post(`/events/${id}/submit`, data);
export const reportTabSwitch = (eventId) => API.post(`/events/${eventId}/tab-switch`);
export const getEventLeaderboard = (id) => API.get(`/events/${id}/leaderboard`);
export const finalizeEvent = (id) => API.post(`/events/${id}/finalize`);
export const getEventFeedback = (id) => API.get(`/events/${id}/feedback`);
export const getUserEventHistory = () => API.get("/events/user/history");

export default API;
