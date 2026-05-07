import { Router, Response } from 'express';
import { query } from '../db.js';
import { requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      "SELECT id, email, full_name, company_name, cnpj, phone, customer_type, city, state, cep, address_street, address_number, address_complement, address_neighborhood, role, created_at FROM profiles WHERE role != 'admin' ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error('Profiles list error:', err);
    res.status(500).json({ message: 'Erro ao listar perfis' });
  }
});

router.put('/:id/role', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    const result = await query(
      'UPDATE profiles SET role = $1 WHERE id = $2 RETURNING id, email, role',
      [role, req.params.id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Perfil não encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Profile role error:', err);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
});

export default router;
