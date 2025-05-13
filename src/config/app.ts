import express, { Express } from "express";
import { setupMiddleware } from "./middleware";
import v1Routes from "../routes/v1Router";

export const createApp = (): Express => {
  const app = express();
  
  setupMiddleware(app);
  
  app.use("/api", v1Routes);
  
  return app;
};