import type { Response } from 'express';
import type { ZodSchema } from 'zod';

export function validatePayload<T>(schema: ZodSchema<T>, payload: unknown, res: Response, message = 'Dados inválidos') {
  const result = schema.safeParse(payload);
  if (!result.success) {
    res.status(400).json({
      message,
      errors: result.error.flatten(),
    });
    return null;
  }
  return result.data;
}
