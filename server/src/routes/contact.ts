import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { contactSubmissionSchema } from '../validators/index.js';
import { validatePayload } from '../utils/validation.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = validatePayload(contactSubmissionSchema, req.body, res, 'Dados de contato inválidos');
    if (!data) return;

    const { name, email, phone, subject, message } = data;
    await query(
      'INSERT INTO contact_submissions (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5)',
      [name, email, phone || '', subject || '', message],
    );
    res.status(201).json({ message: 'Mensagem enviada com sucesso' });
  } catch (err: unknown) {
    console.error('Contact error:', err);
    res.status(500).json({ message: 'Erro ao enviar mensagem' });
  }
});

export default router;
