import { authService } from '../services/authService.js';

export const authController = {
  async register(request, response) {
    const result = await authService.register(request.body);
    response.status(201).json(result);
  },

  async login(request, response) {
    response.json(await authService.login(request.body));
  }
};