import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import { sessionMiddleware } from './config/session.js'
import type { Express } from 'express'

import { testQueue } from './queues/prAnalysisQueue.js'
import { router as authRouter } from './routes/auth.route.js'
import { router as dashboardRouter } from './routes/dashboard.route.js'
import { router as webhookRouter } from './routes/webhook.route.js'
import { registerWebhooks } from './webhooks/index.js'

const app:Express = express()

//mounting the webhooks router before json parsing of body because it required raw body
app.use('/', webhookRouter)

// //testing worker
// app.get("/test-job", async (req, res) => {
//   await prAnalysisQueue.add("analyze-pr", {
//     installationId: 123,
//     repo: "ArchieTansaria/test-repo",
//     prNumber: 1,
//     branch: "main",
//   });

//   res.send("Job added");
// });

app.use(express.json())
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

//register webhook handlers
registerWebhooks()

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