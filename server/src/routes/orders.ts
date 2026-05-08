import { Router, Response } from 'express';
import { getClient, query } from '../db.js';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { createOrderSchema, updateOrderStatusSchema, idParamSchema } from '../validators/index.js';
import { validatePayload } from '../utils/validation.js';

const router = Router();

router.get('/', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: unknown) {
    console.error('Orders list error:', err);
    res.status(500).json({ message: 'Erro ao listar pedidos' });
  }
});

router.get('/my', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user!.id],
    );
    res.json(result.rows);
  } catch (err: unknown) {
    console.error('My orders error:', err);
    res.status(500).json({ message: 'Erro ao buscar seus pedidos' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const payload = validatePayload(createOrderSchema, req.body, res, 'Itens do pedido inválidos');
  if (!payload) return;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { items, notes } = payload;
    const userId = req.user!.id;

    const profileResult = await client.query(
      'SELECT full_name, email, company_name, phone, city, state, address_street, address_number, address_neighborhood, cep FROM profiles WHERE id = $1',
      [userId],
    );
    const profile = profileResult.rows[0];

    if (!profile) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Perfil não encontrado' });
      return;
    }

    const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    const shippingAddr = [
      profile.address_street, profile.address_number,
      profile.address_neighborhood ? `- ${profile.address_neighborhood}` : '',
      profile.city ? `, ${profile.city}` : '',
      profile.state ? `- ${profile.state}` : '',
      profile.cep ? `CEP ${profile.cep}` : '',
    ].filter(Boolean).join(' ');

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, total, customer_name, customer_email, customer_company, customer_phone, shipping_address, notes)
       VALUES ($1, 'pending', $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [userId, total, profile.full_name, profile.email, profile.company_name, profile.phone, shippingAddr, notes || ''],
    );

    const orderId = orderResult.rows[0].id;

    const itemValues = items.map((item, i) =>
      `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`,
    ).join(', ');

    const itemParams = items.flatMap(item => [
      orderId, item.product_id, item.product_name, item.product_sku || '', item.quantity, item.unit_price,
    ]);

    await client.query(
      `INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price) VALUES ${itemValues}`,
      itemParams,
    );

    await client.query('COMMIT');
    res.status(201).json({ id: orderId, message: 'Pedido criado com sucesso' });
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    console.error('Order create error:', err);
    res.status(500).json({ message: 'Erro ao criar pedido' });
  } finally {
    client.release();
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const result = await query(
      'SELECT * FROM orders WHERE id = $1 AND (user_id = $2 OR $3 = true)',
      [params.id, req.user!.id, req.user!.role === 'admin'],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Pedido não encontrado' });
      return;
    }
    const items = await query('SELECT * FROM order_items WHERE order_id = $1', [params.id]);
    res.json({ ...result.rows[0], items: items.rows });
  } catch (err: unknown) {
    console.error('Order detail error:', err);
    res.status(500).json({ message: 'Erro ao buscar pedido' });
  }
});

router.put('/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const data = validatePayload(updateOrderStatusSchema, req.body, res, 'Status inválido');
    if (!data) return;

    const { status } = data;
    const result = await query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, params.id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Pedido não encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Order status error:', err);
    res.status(500).json({ message: 'Erro ao atualizar status' });
  }
});

export default router;
