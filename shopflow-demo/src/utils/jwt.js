import jwt from 'jsonwebtoken';

const secret = () => process.env.JWT_SECRET || 'shopflow-demo-secret-change-me';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, secret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

export function verifyToken(token) {
  const payload = jwt.verify(token, secret());
  return { id: Number(payload.sub), role: payload.role };
}