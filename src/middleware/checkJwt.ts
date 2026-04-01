import { expressjwt, UnauthorizedError } from "express-jwt";
import jwksRsa from "jwks-rsa";
import dotenv from "dotenv";
import { Request,Response,NextFunction } from "express";

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
export const optionalCheckJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as any,
  audience:process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
  credentialsRequired: false,
});
export const handleExpiredJwt = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof UnauthorizedError){
    next();
  }else{
    next(err);
  }
};
 

