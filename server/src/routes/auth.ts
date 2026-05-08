import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth.js';
import { loginSchema, registerSchema, changePasswordSchema } from '../validators/index.js';
import { validatePayload } from '../utils/validation.js';

const router = Router();

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const data = validatePayload(registerSchema, req.body, res, 'Dados de cadastro inválidos');
    if (!data) return;

    const {
      email,
      password,
      fullName,
      companyName,
      cnpj,
      phone,
      customerType,
      city,
      state,
      cep,
      addressStreet,
      addressNumber,
      addressComplement,
      addressNeighborhood,
    } = data;

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
    const data = validatePayload(loginSchema, req.body, res, 'Credenciais inválidas');
    if (!data) return;

    const { email, password } = data;

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

router.put('/password', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = validatePayload(changePasswordSchema, req.body, res, 'Dados inválidos');
    if (!data) return;

    const userResult = await query(
      'SELECT password_hash FROM profiles WHERE id = $1',
      [req.user!.id],
    );
    if (userResult.rows.length === 0) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    const valid = await bcrypt.compare(data.currentPassword, userResult.rows[0].password_hash);
    if (!valid) {
      res.status(400).json({ message: 'Senha atual incorreta' });
      return;
    }

    const newHash = await bcrypt.hash(data.newPassword, 10);
    await query('UPDATE profiles SET password_hash = $1 WHERE id = $2', [newHash, req.user!.id]);

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err: unknown) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Erro ao alterar senha' });
  }
});

export default router;
