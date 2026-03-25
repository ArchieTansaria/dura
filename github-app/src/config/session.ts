import session from "express-session";
import { RedisStore } from "connect-redis";
import { redisClient } from "./redisClient.js";
import { getEnv } from "../utils/envValidator.js";

export const sessionMiddleware = session({
  store: new RedisStore({
    client: redisClient,
    prefix: "sess:",
  }),
  secret: getEnv("SESSION_SECRET"),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", //true in prod, false in dev
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  },
});
