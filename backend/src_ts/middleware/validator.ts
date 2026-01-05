import { type NextFunction, type Request, type Response } from 'express';
import { type AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed && typeof parsed === 'object') {
      if ('body' in parsed && parsed.body !== undefined) req.body = parsed.body;
      if ('query' in parsed && parsed.query !== undefined) req.query = parsed.query;
      if ('params' in parsed && parsed.params !== undefined) req.params = parsed.params;
    }

    next();
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: 'Validation error', issues: err.issues });
      return;
    }
    next(err as any);
  }
};
