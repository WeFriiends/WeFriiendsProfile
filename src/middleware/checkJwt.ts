import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.AUTH0_DOMAIN) {
  throw new Error("Missing required environment variable: AUTH0_DOMAIN");
}
if (!process.env.AUTH0_AUDIENCE) {
  throw new Error("Missing required environment variable: AUTH0_AUDIENCE");
}

export const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as any,
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});
