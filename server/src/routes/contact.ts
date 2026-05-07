import { Router, Request, Response } from 'express';
import { query } from '../db.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ message: 'Nome, e-mail e mensagem são obrigatórios' });
      return;
    }
    await query(
      'INSERT INTO contact_submissions (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5)',
      [name, email, phone || '', subject || '', message],
    );
    res.status(201).json({ message: 'Mensagem enviada com sucesso' });
  } catch (err: any) {
    console.error('Contact error:', err);
    res.status(500).json({ message: 'Erro ao enviar mensagem' });
  }
});

export default router;
