import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { requireAdmin, AuthRequest } from '../middleware/auth.js';
import { paymentMethodSchema, idParamSchema } from '../validators/index.js';
import { validatePayload } from '../utils/validation.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const isAdmin = req.headers.authorization?.startsWith('Bearer ') &&
      (await (async () => {
        try {
          const authHeader = req.headers.authorization!;
          const token = authHeader.slice(7);
          const jwt = await import('jsonwebtoken');
          const decoded = jwt.default.verify(token, process.env.JWT_SECRET!) as AuthRequest['user'];
          return decoded?.role === 'admin';
        } catch { return false; }
      })());

    const showAll = isAdmin && req.query.all === 'true';
    const sql = showAll
      ? 'SELECT * FROM payment_methods ORDER BY sort_order'
      : 'SELECT * FROM payment_methods WHERE active = true ORDER BY sort_order';
    const result = await query(sql);
    res.json(result.rows);
  } catch (err: unknown) {
    console.error('Payment list error:', err);
    res.status(500).json({ message: 'Erro ao listar pagamentos' });
  }
});

router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = validatePayload(paymentMethodSchema, req.body, res, 'Dados de pagamento inválidos');
    if (!data) return;

    const { name, description, icon, discount_text, sort_order, active } = data;
    const result = await query(
      `INSERT INTO payment_methods (name, description, icon, discount_text, sort_order, active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, icon, discount_text, sort_order, active],
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Payment create error:', err);
    res.status(500).json({ message: 'Erro ao criar pagamento' });
  }
});

router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const data = validatePayload(paymentMethodSchema, req.body, res, 'Dados de pagamento inválidos');
    if (!data) return;

    const { name, description, icon, discount_text, sort_order, active } = data;
    const result = await query(
      `UPDATE payment_methods SET name = $1, description = $2, icon = $3, discount_text = $4,
       sort_order = $5, active = $6 WHERE id = $7 RETURNING *`,
      [name, description, icon, discount_text, sort_order, active, params.id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Pagamento não encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Payment update error:', err);
    res.status(500).json({ message: 'Erro ao atualizar pagamento' });
  }
});

router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const result = await query('DELETE FROM payment_methods WHERE id = $1 RETURNING id', [params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Pagamento não encontrado' });
      return;
    }
    res.json({ message: 'Pagamento excluído' });
  } catch (err: unknown) {
    console.error('Payment delete error:', err);
    res.status(500).json({ message: 'Erro ao excluir pagamento' });
  }
});

export default router;
