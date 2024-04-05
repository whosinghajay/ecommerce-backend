import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  getBarCharts,
  getDashBoardStats,
  getLineCharts,
  getPieCharts,
} from "../controllers/stats.js";

const app = express.Router();

app.get("/stats", adminOnly, getDashBoardStats);
app.get("/pie", adminOnly, getPieCharts);
app.get("/bar", adminOnly, getBarCharts);
app.get("/line", adminOnly, getLineCharts);

export default app;
