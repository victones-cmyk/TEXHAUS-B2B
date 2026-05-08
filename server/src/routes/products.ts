import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { requireAdmin, AuthRequest } from '../middleware/auth.js';
import {
  createProductSchema,
  updateProductSchema,
  upsertVariationsSchema,
  idParamSchema,
} from '../validators/index.js';
import { validatePayload } from '../utils/validation.js';

const router = Router();

function normalizeProductRow<T extends Record<string, unknown>>(row: T): T {
  let result = { ...row };

  const rawPrice = result.price;
  if (typeof rawPrice === 'string') {
    const n = parseFloat(rawPrice);
    if (!isNaN(n)) result = { ...result, price: n as T['price'] };
  }

  const rawStock = result.stock_quantity;
  if (typeof rawStock === 'string') {
    const n = parseInt(rawStock, 10);
    if (!isNaN(n)) result = { ...result, stock_quantity: n as T['stock_quantity'] };
  }

  const value = result.images;
  if (Array.isArray(value)) return result;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return { ...result, images: parsed as T['images'] };
    } catch {
      if (value === '{}') return { ...result, images: [] as unknown as T['images'] };
      return {
        ...result,
        images: value.slice(1, -1).split(',').map(v => v.replace(/^"(.*)"$/, '$1')) as unknown as T['images'],
      };
    }
  }
  return { ...result, images: [] as unknown as T['images'] };
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows.map(normalizeProductRow));
  } catch (err: unknown) {
    console.error('Products list error:', err);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
});

router.get('/published', async (_req: Request, res: Response) => {
  try {
    const result = await query("SELECT * FROM products WHERE status = 'published' ORDER BY created_at DESC");
    res.json(result.rows.map(normalizeProductRow));
  } catch (err: unknown) {
    console.error('Products published error:', err);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const result = await query('SELECT * FROM products WHERE id = $1', [params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Produto não encontrado' });
      return;
    }
    res.json(normalizeProductRow(result.rows[0]));
  } catch (err: unknown) {
    console.error('Product detail error:', err);
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
});

router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = validatePayload(createProductSchema, req.body, res, 'Dados do produto inválidos');
    if (!data) return;

    const { name, sku, category, price, stock_quantity, image_url, images, description, status } = data;
    const result = await query(
      `INSERT INTO products (name, sku, category, price, stock_quantity, image_url, images, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, sku, category, price, stock_quantity, image_url, images, description, status],
    );
    res.status(201).json(normalizeProductRow(result.rows[0]));
  } catch (err: unknown) {
    console.error('Product create error:', err);
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
});

router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const data = validatePayload(updateProductSchema, req.body, res, 'Dados do produto inválidos');
    if (!data) return;

    const { name, sku, category, price, stock_quantity, image_url, images, description, status } = data;
    const result = await query(
      `UPDATE products SET name = $1, sku = $2, category = $3, price = $4, stock_quantity = $5,
       image_url = $6, images = $7, description = $8, status = $9 WHERE id = $10 RETURNING *`,
      [name, sku, category, price, stock_quantity, image_url, images, description, status, params.id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Produto não encontrado' });
      return;
    }
    res.json(normalizeProductRow(result.rows[0]));
  } catch (err: unknown) {
    console.error('Product update error:', err);
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
});

router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    await query('DELETE FROM product_variations WHERE product_id = $1', [params.id]);
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [params.id]);
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
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const result = await query(
      'SELECT * FROM product_variations WHERE product_id = $1 ORDER BY sort_order',
      [params.id],
    );
    res.json(result.rows);
  } catch (err: unknown) {
    console.error('Variations list error:', err);
    res.status(500).json({ message: 'Erro ao listar variações' });
  }
});

router.put('/:id/variations', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const productId = params.id;
    const variations = validatePayload(upsertVariationsSchema, req.body, res, 'Variações inválidas');
    if (!variations) return;

    await query('DELETE FROM product_variations WHERE product_id = $1', [productId]);

    if (variations.length > 0) {
      const values = variations.map((v, i) =>
        `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`,
      ).join(', ');

      const params = variations.flatMap(v => [
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
