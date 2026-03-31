import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import * as dashboardController from '../controllers/dashboard.controller.js'
import * as repoController from '../controllers/repo.controller.js'

export const router = express.Router()

router.get('/api/dashboard', requireAuth, dashboardController.dashboard)
router.get('/api/repo/:owner/:name', requireAuth, repoController.getRepoAnalysis)
router.post('/api/repo/:owner/:name/scan', requireAuth, repoController.triggerScan)