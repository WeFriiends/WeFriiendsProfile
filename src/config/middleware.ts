import express, { Express } from "express";
import cors from "cors";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./swagger";

export const setupMiddleware = (app: Express): void => {
  // CORS configuration
  app.use(
    cors({
      origin: "http://localhost:3000", // Replace with your frontend's URL
    })
  );

  // Body parser middleware
  app.use(express.json());

  // Swagger documentation
  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};