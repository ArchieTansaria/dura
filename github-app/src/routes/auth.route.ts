import express from 'express'
import * as authController from '../controllers/auth.controller.js'

export const router = express.Router()

//after user clicks 'connect to github', it first logs the user in followed by dura installation - oauth + app install

//user clicks login
router.get("/login", authController.login);

//user clicks connect to gh
router.get('/connect/github', authController.connectToGithub)

//redirect to github
router.get('/auth/github', authController.githubAuth)

//redirect back to user
router.get('/auth/callback', authController.callback)

//user installs dura app
router.get('/auth/install', authController.installApp)