import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import { sessionMiddleware } from './config/session.js'
import type { Express } from 'express'

import { testQueue } from './queues/prAnalysisQueue.js'
import { router as authRouter } from './routes/auth.route.js'
import { router as dashboardRouter } from './routes/dashboard.route.js'

const app:Express = express()
app.use(morgan('dev'))

async function connectToDB(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log("db successfully connected")
  } catch (error) {
    console.error("connection to db failed", error)
  }
};

connectToDB()
testQueue()

//using redis for session management
app.use(sessionMiddleware);

app.get("/", (req, res) => {
  res.send("this is durakit")
})

app.use('/', authRouter)
app.use('/', dashboardRouter)

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})