import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

/**
 * Middleware para validar requisições usando schemas Zod
 * @param schema - Schema Zod para validação
 * @returns Middleware Express
 */
export const validateSchema = (schema: ZodType<any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validar a requisição completa (body, params, query)
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatar erros do Zod de forma amigável
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
      
      // Erro inesperado
      console.error('Erro no middleware de validação:', error);
      res.status(500).json({
        error: 'Erro interno ao validar dados',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };
};
