import { Request, Response, NextFunction } from 'express';
import { ZodSchema, z } from 'zod';

const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida os dados da requisição usando o schema do Zod
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(); // Se válido, continua para o próximo middleware ou controller
    } catch (error) {
      // Verifica se o erro é uma instância de ZodError
      if (error instanceof z.ZodError) {
        // Retorna os erros de validação detalhados
        return res.status(400).json({
          error: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      // Caso seja outro tipo de erro, retorna um erro genérico
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };
};

export default validate;