import { getEnv } from "../utils/envValidator.js";

const redisUrl = getEnv('REDIS_URL')

export const redisConnection = {
  url: redisUrl
}