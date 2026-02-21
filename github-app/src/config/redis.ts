//initialising a redis client

import { Redis } from "ioredis";
import { getEnv } from '../utils/envValidator.js'

export const redisClient = new Redis(getEnv("REDIS_URL"));