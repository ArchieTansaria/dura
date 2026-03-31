import { Queue } from 'bullmq'
import { getEnv } from '../utils/envValidator.js'

export const AnalysisQueue = new Queue('AnalysisQueue', {
  connection : {
    url: getEnv("REDIS_URL")
  }
})