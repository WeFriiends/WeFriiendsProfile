import webPush from "web-push";
import dotenv from "dotenv";

dotenv.config();

// In production, use environment variables for VAPID keys
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

// Generate keys only if they don't exist in environment
const vapidKeys = publicKey && privateKey 
  ? { publicKey, privateKey } 
  : webPush.generateVAPIDKeys();

// If keys were generated, log them so they can be added to environment variables
if (!publicKey || !privateKey) {
  console.log("Generated VAPID Keys - add these to your environment variables:");
  console.log(vapidKeys);
}

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:email@example.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const getPublicKey = () => vapidKeys.publicKey;
export default webPush;