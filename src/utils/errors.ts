import { Response } from "express";

export function handleServiceError(
  error: unknown,
  defaultMessage: string,
  res: Response,
  statusCode: number = 500
): Response {
  const message = error instanceof Error ? error.message : defaultMessage;
  return res.status(statusCode).json({ message });
}