import express, { Express } from "express";
import cors from "cors";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./swagger";

export const setupMiddleware = (app: Express): void => {
  app.use(
    cors({
      origin: ["http://localhost:3000", "https://wefriiends.com", "https://www.wefriiends.com", "https://warm-frangollo-93bfd5.netlify.app"], // Allow both local and production domains
    })
  );

  app.use(express.json());

  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
