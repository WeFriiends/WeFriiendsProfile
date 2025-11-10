export function handleServiceError(error: unknown, defaultMessage: string) {
  if (error instanceof Error) throw new Error(error.message);
  throw new Error(defaultMessage);
}