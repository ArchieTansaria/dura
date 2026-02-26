import { Queue } from 'bullmq'

export const prAnalysisQueue = new Queue('prAnalysisQueue', {
  connection : {
    host : "localhost",
    port : 6379 
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