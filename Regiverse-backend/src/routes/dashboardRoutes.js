import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

// GET /api/dashboard/stats/:conferenceId
router.get("/stats/:conferenceId", getDashboardStats);
router.get("/stats", getDashboardStats);

export default router;