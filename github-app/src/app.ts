import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import morgan from 'morgan'
import session from 'express-session'
import type { Express } from 'express'

import { testQueue } from './queues/prAnalysisQueue'
import { getEnv } from './utils/envValidator'

dotenv.config({ path: "./.env" })

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

app.use(session({
  secret: getEnv('SESSION_SECRET'),
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.get("/", (req, res) => {
  res.send("this is durakit")
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})