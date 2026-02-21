import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import * as dashboardController from '../controllers/dashboard.controller.js'

export const router = express.Router()

router.get('/api/dashboard', requireAuth, dashboardController.dashboard)