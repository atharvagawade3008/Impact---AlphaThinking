import bcrypt from 'bcryptjs';
import { userModel } from '../models/userModel.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';

export const authService = {
  async register({ name, email, password }) {
    if (userModel.findByEmail(email)) throw new AppError(409, 'Email is already registered');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = userModel.create({ name, email, passwordHash });
    return { user, token: signToken(user) };
  },

  async login({ email, password }) {
    const record = userModel.findByEmail(email);
    const passwordMatches = record && await bcrypt.compare(password, record.password_hash);
    if (!passwordMatches) throw new AppError(401, 'Email or password is incorrect');
    const user = userModel.findById(record.id);
    return { user, token: signToken(user) };
  }
};