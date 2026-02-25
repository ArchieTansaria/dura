//initialising and connecting to a redis client for session management

import { createClient } from 'redis'; 
import { redisConnection } from './redisConnection.js';

export const redisClient = createClient(redisConnection);

redisClient.on("connect", () => {
  console.log("Redis (session) connected");
});

redisClient.on("error", (err) => {
  console.error("Redis (session) error:", err);
});

await redisClient.connect();