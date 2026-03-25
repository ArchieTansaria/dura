import { Queue } from 'bullmq'
import { getEnv } from '../utils/envValidator.js'

export const prAnalysisQueue = new Queue('prAnalysisQueue', {
  connection : {
    url: getEnv("REDIS_URL")
  }
})

export async function testQueue() {
  try {
    await prAnalysisQueue.waitUntilReady()
    console.log("bullMQ connected to redis")
  } catch (error) {
    console.error("bullMQ failed to connect:", error)
  }
}