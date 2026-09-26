import { userModel } from '../models/userModel.js';
import { AppError } from '../utils/errors.js';

export const userService = {
  getProfile(userId) {
    const user = userModel.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  },

  updateProfile(userId, fields) {
    this.getProfile(userId);
    if (fields.email && userModel.findByEmail(fields.email)?.id !== userId) {
      throw new AppError(409, 'Email is already registered');
    }
    return userModel.update(userId, fields);
  }
};