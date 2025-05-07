import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import profileRoutes from "./routes/profile";
import photosRoutes from "./routes/photo";
import chatsRoutes from "./routes/chat";
import dislikesRoutes from "./routes/dislikes.route";
import matchRoutes from "./routes/match.route";
import likesRoutes from "./routes/likes.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Allow requests from your frontend's origin
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend's URL
  })
);

// Middleware
app.use(express.json());
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI! as string)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// Swagger Setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "SPA Backend API",
      version: "1.0.0",
      description: "API for SPA backend",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/api/profile", profileRoutes);
app.use("/api/dislikes", dislikesRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/photos", photosRoutes);
app.use("/api/chats", chatsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
