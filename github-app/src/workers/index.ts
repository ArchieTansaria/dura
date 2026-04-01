import 'dotenv/config';
import mongoose from 'mongoose';

async function connectToDB(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("[workers] DB successfully connected");
  } catch (error) {
    console.error("[workers] connection to db failed", error);
  }
}

connectToDB();

import './pr.worker.js';
import './analysis.worker.js';

console.log("[workers] All workers initialized and listening to BullMQ queues.");
