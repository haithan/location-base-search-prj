import jwt from 'jsonwebtoken';
import { config } from '../../src/config';

export const createMockAuthToken = (userId: number = 1, username: string = 'testuser') => {
  const payload = {
    userId,
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };

  return jwt.sign(payload, config.jwtSecret);
};

export const getAuthHeaders = (token?: string) => {
  const authToken = token || createMockAuthToken();
  return {
    'Authorization': `Bearer ${authToken}`
  };
};
