//initialising and connecting to a redis client for session management

import { createClient } from 'redis';
import { getEnv } from '../utils/envValidator.js'

export const redisClient = createClient({
  url: getEnv("REDIS_URL"),
});

await redisClient.connect();

redisClient.on("connect", () => {
  console.log("Redis (session) connected");
});

redisClient.on("error", (err) => {
  console.error("Redis (session) error:", err);
});