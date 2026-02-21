import "express-session";
import type { Types } from "mongoose";

declare module "express-session" {
  interface SessionData {
    oauthState?: string,
    oauthIntent?: 'login' | 'install',
    userId?: Types.ObjectId;
  }
}