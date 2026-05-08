import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { requireAdmin, AuthRequest } from '../middleware/auth.js';
import { createPostSchema, updatePostSchema, idParamSchema } from '../validators/index.js';
import { validatePayload } from '../utils/validation.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: unknown) {
    console.error('Posts list error:', err);
    res.status(500).json({ message: 'Erro ao listar posts' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const result = await query('SELECT * FROM posts WHERE id = $1', [params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Post não encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Post detail error:', err);
    res.status(500).json({ message: 'Erro ao buscar post' });
  }
});

router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = validatePayload(createPostSchema, req.body, res, 'Dados do post inválidos');
    if (!data) return;

    const { title, content, excerpt, category, image_url } = data;
    const result = await query(
      'INSERT INTO posts (title, content, excerpt, category, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, content || '', excerpt || '', category || '', image_url || ''],
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Post create error:', err);
    res.status(500).json({ message: 'Erro ao criar post' });
  }
});

router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const data = validatePayload(updatePostSchema, req.body, res, 'Dados do post inválidos');
    if (!data) return;

    const { title, content, excerpt, category, image_url } = data;
    const result = await query(
      'UPDATE posts SET title = $1, content = $2, excerpt = $3, category = $4, image_url = $5 WHERE id = $6 RETURNING *',
      [title, content, excerpt, category, image_url, params.id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Post não encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Post update error:', err);
    res.status(500).json({ message: 'Erro ao atualizar post' });
  }
});

router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const params = validatePayload(idParamSchema, req.params, res, 'ID inválido');
    if (!params) return;

    const result = await query('DELETE FROM posts WHERE id = $1 RETURNING id', [params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Post não encontrado' });
      return;
    }
    res.json({ message: 'Post excluído' });
  } catch (err: unknown) {
    console.error('Post delete error:', err);
    res.status(500).json({ message: 'Erro ao excluir post' });
  }
});

export default router;
