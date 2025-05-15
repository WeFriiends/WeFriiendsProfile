import * as admin from "firebase-admin";
import { Database } from "firebase-admin/database";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Initialize server-side Firebase Admin SDK
let adminDb: Database | undefined;
try {
  const serviceAccountPath = __dirname + "/firebaseAdminsdk.json";

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_RTDB,
    });

    adminDb = admin.database();
    console.log("Firebase Admin SDK initialized successfully");
  } else {
    console.error(`Service account file not found at ${serviceAccountPath}`);
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error);
}

console.log("Firebase Realtime DB initialized successfully.");

export { admin, adminDb };
export default adminDb;