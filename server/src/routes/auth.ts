import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, fullName, companyName, cnpj, phone, customerType, city, state, cep, addressStreet, addressNumber, addressComplement, addressNeighborhood } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
      return;
    }

    const existing = await query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ message: 'E-mail já cadastrado' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO profiles (email, password_hash, full_name, company_name, cnpj, phone, customer_type, city, state, cep, address_street, address_number, address_complement, address_neighborhood, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'b2b_pending')
       RETURNING id, email, role, created_at`,
      [email, passwordHash, fullName || '', companyName || '', cnpj || '', phone || '', customerType || '', city || '', state || '', cep || '', addressStreet || '', addressNumber || '', addressComplement || '', addressNeighborhood || ''],
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch (err: unknown) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Erro ao cadastrar' });
  }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
      return;
    }

    const result = await query(
      'SELECT id, email, password_hash, role FROM profiles WHERE email = $1',
      [email],
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'E-mail ou senha inválidos' });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      res.status(401).json({ message: 'E-mail ou senha inválidos' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err: unknown) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, email, full_name, company_name, cnpj, phone, customer_type, city, state,
              cep, address_street, address_number, address_complement, address_neighborhood, role, created_at
       FROM profiles WHERE id = $1`,
      [req.user!.id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Perfil não encontrado' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err: unknown) {
    console.error('Me error:', err);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

export default router;
