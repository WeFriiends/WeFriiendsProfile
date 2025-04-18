import express from "express";
import mongoose from "mongoose";
import admin from "./firebase/firebase";
import dotenv from "dotenv";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import profileRoutes from "./routes/profile";
import photosRoutes from "./routes/photo";
import chatsRoutes from "./routes/chat";

dotenv.config();

const app = express();
const db = admin.firestore();
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
app.get("/firebase", async (req, res) => {
  try {
    const snapshot = await db.collection(process.env.FIREBASE_MATCHES!).get();
    const data: any[] = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    res.json(data);
  } catch (error) {
    console.error("Error getting data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.delete("/firebase", async (req, res) => {
  try {
    const snapshot = await db.collection(process.env.FIREBASE_MATCHES!).get();

    if (snapshot.empty) {
      return res.json({ message: "No documents to delete" });
    }

    const deletePromises = snapshot.docs.map((doc) =>
      db.collection(process.env.FIREBASE_MATCHES!).doc(doc.id).delete()
    );

    await Promise.all(deletePromises);
    res.json({ message: "All documents deleted successfully" });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ message: "Error deleting documents" });
  }
});

app.get("/firebase/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const elem = await db
      .collection(process.env.FIREBASE_MATCHES!)
      .doc(id)
      .get();
    if (!elem.exists) {
      res.status(404).send("Document not found");
      return;
    }
    res.json({ id: elem.id, ...elem.data() });
  } catch (error) {
    console.error("Error getting data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.post("/firebase", async (req, res) => {
  try {
    const data = req.body;

    const result = await db.collection(process.env.FIREBASE_MATCHES!).add(data);

    res.json(result);
  } catch (error) {
    console.error("Error getting data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.use("/api/profile", profileRoutes);
app.use("/api/photos", photosRoutes);
app.use("/api/chats", chatsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
