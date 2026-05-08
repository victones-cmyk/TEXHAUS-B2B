import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { requireAdmin, requireAuth, AuthRequest } from '../middleware/auth.js';
import { shippingMethodSchema, idParamSchema } from '../validators/index.js';
import { validatePayload } from '../utils/validation.js';

const router = Router();

function normalizeRegions<T extends Record<string, unknown>>(row: T): T {
  const value = row.regions;
  if (Array.isArray(value)) return row;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return { ...row, regions: parsed as T['regions'] };
    } catch {
      if (value === '{}') return { ...row, regions: [] as unknown as T['regions'] };
      return {
        ...row,
        regions: value.slice(1, -1).split(',').map(v => v.replace(/^"(.*)"$/, '$1')) as unknown as T['regions'],
      };
    }
  }
  return { ...row, regions: [] as unknown as T['regions'] };
}

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
      ? 'SELECT * FROM shipping_methods ORDER BY sort_order'
      : 'SELECT * FROM shipping_methods WHERE active = true ORDER BY sort_order';
    const result = await query(sql);
    res.json(result.rows.map(normalizeRegions));
  } catch (err: unknown) {
    console.error('Shipping list error:', err);
    res.status(500).json({ message: 'Erro ao listar fretes' });
  }
});

router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = validatePayload(shippingMethodSchema, req.body, res, 'Dados de frete inválidos');
    if (!data) return;

    const { name, description, price, regions, estimated_days, sort_order, active } = data;
    const result = await query(
      `INSERT INTO shipping_methods (name, description, price, regions, estimated_days, sort_order, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, price, regions, estimated_days, sort_order, active],
    );
    res.status(201).json(normalizeRegions(result.rows[0]));
  } catch (err: unknown) {
    console.error('Shipping create error:', err);
    res.status(500).json({ message: 'Erro ao criar frete' });
  }
});

router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const data = validatePayload(shippingMethodSchema, req.body, res, 'Dados de frete inválidos');
    if (!data) return;

    const { name, description, price, regions, estimated_days, sort_order, active } = data;
    const result = await query(
      `UPDATE shipping_methods SET name = $1, description = $2, price = $3, regions = $4,
       estimated_days = $5, sort_order = $6, active = $7 WHERE id = $8 RETURNING *`,
      [name, description, price, regions, estimated_days, sort_order, active, params.id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Frete não encontrado' });
      return;
    }
    res.json(normalizeRegions(result.rows[0]));
  } catch (err: unknown) {
    console.error('Shipping update error:', err);
    res.status(500).json({ message: 'Erro ao atualizar frete' });
  }
});

router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const result = await query('DELETE FROM shipping_methods WHERE id = $1 RETURNING id', [params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Frete não encontrado' });
      return;
    }
    res.json({ message: 'Frete excluído' });
  } catch (err: unknown) {
    console.error('Shipping delete error:', err);
    res.status(500).json({ message: 'Erro ao excluir frete' });
  }
});

export default router;
