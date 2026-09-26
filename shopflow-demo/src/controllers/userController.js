import { userService } from '../services/userService.js';

export const userController = {
  getProfile(request, response) {
    response.json({ user: userService.getProfile(request.user.id) });
  },

  updateProfile(request, response) {
    response.json({ user: userService.updateProfile(request.user.id, request.body) });
  }
};