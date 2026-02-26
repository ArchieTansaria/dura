import express from 'express'
import * as webhookController from '../controllers/webhook.controller.js'

export const router = express.Router()

// using raw body for hmac signature verification
router.post('/webhook', express.raw({ type: "application/json" }), webhookController.webhookHandler)