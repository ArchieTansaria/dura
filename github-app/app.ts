import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import morgan from 'morgan'
import type { Express } from 'express'

import { testQueue } from './queues/prAnalysisQueue'

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

app.get("/", (req, res) => {
  res.send("this is dura")
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})