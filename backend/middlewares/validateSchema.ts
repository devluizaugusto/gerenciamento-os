import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

/**
 * Middleware to validate requests using Zod schemas
 * @param schema - Zod schema for validation
 * @returns Express middleware
 */
export const validateSchema = (schema: ZodType<any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate the complete request (body, params, query)
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors in a friendly way
        const errors = error.issues.map((err) => ({
          campo: err.path.join('.'),
          mensagem: err.message
        }));
        
        res.status(400).json({
          error: 'Erro de validação',
          detalhes: errors
        });
        return;
      }
      
      // Unexpected error
      console.error('Erro no middleware de validação:', error);
      res.status(500).json({
        error: 'Erro interno ao validar dados',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };
};
