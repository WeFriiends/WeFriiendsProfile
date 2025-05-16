import webPush from "web-push";
import dotenv from "dotenv";

dotenv.config();

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

const vapidKeys = publicKey && privateKey 
  ? { publicKey, privateKey } 
  : webPush.generateVAPIDKeys();

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