import { Request, Response, NextFunction } from 'express';
import { ZodSchema, z } from 'zod';

const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Valida apenas o req.body diretamente
      await schema.parseAsync(req.body);
      next(); // Se válido, continua para o próximo middleware ou controller
    } catch (error) {
      // Verifica se o erro é uma instância de ZodError
      if (error instanceof z.ZodError) {
        // Retorna os erros de validação detalhados
        res.status(400).json({
          error: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      // Caso seja outro tipo de erro, retorna um erro genérico
      res.status(500).json({ error: 'An unexpected error occurred' });
      return;
    }
  };
};

export default validate;