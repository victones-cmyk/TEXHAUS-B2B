import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { requireAdmin, AuthRequest } from '../middleware/auth.js';
import { categorySchema, idParamSchema } from '../validators/index.js';
import { validatePayload } from '../utils/validation.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY sort_order');
    res.json(result.rows);
  } catch (err: unknown) {
    console.error('Categories list error:', err);
    res.status(500).json({ message: 'Erro ao listar categorias' });
  }
});

router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = validatePayload(categorySchema, req.body, res, 'Dados da categoria inválidos');
    if (!data) return;

    const { name, slug, parent_id } = data;
    const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    const result = await query(
      'INSERT INTO categories (name, slug, parent_id) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), normalizedSlug, parent_id || null],
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Category create error:', err);
    res.status(500).json({ message: err instanceof Error ? err.message : 'Erro ao criar categoria' });
  }
});

router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const data = validatePayload(categorySchema, req.body, res, 'Dados da categoria inválidos');
    if (!data) return;

    const { name, slug, parent_id } = data;
    const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    const result = await query(
      'UPDATE categories SET name = $1, slug = $2, parent_id = $3 WHERE id = $4 RETURNING *',
      [name.trim(), normalizedSlug, parent_id || null, params.id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Categoria não encontrada' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Category update error:', err);
    res.status(500).json({ message: err instanceof Error ? err.message : 'Erro ao atualizar categoria' });
  }
});

router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const children = await query('SELECT id FROM categories WHERE parent_id = $1', [params.id]);
    if (children.rows.length > 0) {
      res.status(400).json({ message: 'Exclua as subcategorias primeiro.' });
      return;
    }
    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Categoria não encontrada' });
      return;
    }
    res.json({ message: 'Categoria excluída' });
  } catch (err: unknown) {
    console.error('Category delete error:', err);
    res.status(500).json({ message: 'Erro ao excluir categoria' });
  }
});

export default router;
