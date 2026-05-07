import { Router, Response } from 'express';
import { query } from '../db.js';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: any) {
    console.error('Orders list error:', err);
    res.status(500).json({ message: 'Erro ao listar pedidos' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const client = await (await import('../db.js')).getClient();
  try {
    const { items, notes } = req.body;
    const userId = req.user!.id;

    if (!items || items.length === 0) {
      res.status(400).json({ message: 'Carrinho vazio' });
      return;
    }

    const profileResult = await client.query(
      'SELECT full_name, email, company_name, phone, city, state, address_street, address_number, address_neighborhood, cep FROM profiles WHERE id = $1',
      [userId],
    );
    const profile = profileResult.rows[0];

    const total = items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0);

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

    const itemValues = items.map((item: any, i: number) =>
      `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`,
    ).join(', ');

    const itemParams = items.flatMap((item: any) => [
      orderId, item.product_id, item.product_name, item.product_sku || '', item.quantity, item.unit_price,
    ]);

    await client.query(
      `INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price) VALUES ${itemValues}`,
      itemParams,
    );

    res.status(201).json({ id: orderId, message: 'Pedido criado com sucesso' });
  } catch (err: any) {
    console.error('Order create error:', err);
    res.status(500).json({ message: 'Erro ao criar pedido' });
  } finally {
    client.release();
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE id = $1 AND (user_id = $2 OR $3 = true)',
      [req.params.id, req.user!.id, req.user!.role === 'admin'],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Pedido não encontrado' });
      return;
    }
    const items = await query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
    res.json({ ...result.rows[0], items: items.rows });
  } catch (err: any) {
    console.error('Order detail error:', err);
    res.status(500).json({ message: 'Erro ao buscar pedido' });
  }
});

router.put('/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const result = await query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Pedido não encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Order status error:', err);
    res.status(500).json({ message: 'Erro ao atualizar status' });
  }
});

export default router;
