import { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';


const rawJwtSecret = process.env.JWT_SECRET;

if (!rawJwtSecret) {
  throw new Error('JWT_SECRET não configurado nas variáveis de ambiente.');
}

const JWT_SECRET: string = rawJwtSecret;

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded !== 'object' || decoded === null) {
      res.status(401).json({ message: 'Token inválido ou expirado' });
      return;
    }

    const payload = decoded as JwtPayload & Partial<AuthUser>;

    if (!payload.id || !payload.email || !payload.role) {
      res.status(401).json({ message: 'Token inválido ou expirado' });
      return;
    }

    req.user = {
      id: String(payload.id),
      email: String(payload.email),
      role: String(payload.role),
    };
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  await requireAuth(req, res, async () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Acesso restrito a administradores' });
      return;
    }
    next();
  });
}

export function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}
