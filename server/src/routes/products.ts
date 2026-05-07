import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: unknown) {
    console.error('Products list error:', err);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
});

router.get('/published', async (_req: Request, res: Response) => {
  try {
    const result = await query("SELECT * FROM products WHERE status = 'published' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err: unknown) {
    console.error('Products published error:', err);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Produto não encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Product detail error:', err);
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
});

router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, sku, category, price, stock_quantity, image_url, images, description, status } = req.body;
    const result = await query(
      `INSERT INTO products (name, sku, category, price, stock_quantity, image_url, images, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, sku || '', category || '', price || 0, stock_quantity || 0, image_url || '', JSON.stringify(images || []), description || '', status || 'draft'],
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Product create error:', err);
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
});

router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, sku, category, price, stock_quantity, image_url, images, description, status } = req.body;
    const result = await query(
      `UPDATE products SET name = $1, sku = $2, category = $3, price = $4, stock_quantity = $5,
       image_url = $6, images = $7, description = $8, status = $9 WHERE id = $10 RETURNING *`,
      [name, sku, category, price, stock_quantity, image_url, JSON.stringify(images), description, status, req.params.id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Produto não encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Product update error:', err);
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
});

router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM product_variations WHERE product_id = $1', [req.params.id]);
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Produto não encontrado' });
      return;
    }
    res.json({ message: 'Produto excluído' });
  } catch (err: unknown) {
    console.error('Product delete error:', err);
    res.status(500).json({ message: 'Erro ao excluir produto' });
  }
});

// --- Variações ---

router.get('/:id/variations', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM product_variations WHERE product_id = $1 ORDER BY sort_order',
      [req.params.id],
    );
    res.json(result.rows);
  } catch (err: unknown) {
    console.error('Variations list error:', err);
    res.status(500).json({ message: 'Erro ao listar variações' });
  }
});

router.put('/:id/variations', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const productId = req.params.id;
    const variations = req.body;

    await query('DELETE FROM product_variations WHERE product_id = $1', [productId]);

    if (variations.length > 0) {
      const values = variations.map((v: { name: string; sku: string; price_modifier: number; stock_quantity: number; image_url: string; sort_order: number }, i: number) =>
        `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`,
      ).join(', ');

      const params = variations.flatMap((v: { name: string; sku: string; price_modifier: number; stock_quantity: number; image_url: string; sort_order: number }) => [
        productId, v.name, v.sku || '', v.price_modifier || 0, v.stock_quantity || 0, v.image_url || '', v.sort_order || 0,
      ]);

      await query(
        `INSERT INTO product_variations (product_id, name, sku, price_modifier, stock_quantity, image_url, sort_order) VALUES ${values}`,
        params,
      );
    }

    res.json({ message: 'Variações salvas' });
  } catch (err: unknown) {
    console.error('Variations save error:', err);
    res.status(500).json({ message: 'Erro ao salvar variações' });
  }
});

export default router;
