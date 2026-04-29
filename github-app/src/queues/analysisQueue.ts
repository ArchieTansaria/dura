import { Queue } from 'bullmq'
import { getEnv } from '../utils/envValidator.js'

export const AnalysisQueue = new Queue('AnalysisQueue', {
  connection : {
    url: getEnv("REDIS_URL")
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: { age: 86400 }, // clean up failed jobs after 24h
  }
})