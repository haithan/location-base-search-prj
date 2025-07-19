import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { createError } from '../middleware/errorHandler';
import { CreateUserRequest, LoginRequest, ApiResponse, LoginResponse } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      const result = await this.authService.registerUser(userData);

      const response: ApiResponse<LoginResponse> = {
        success: true,
        data: result,
        message: 'User registered successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'User with this email or username already exists') {
        throw createError('User with this email or username already exists', 409);
      }
      throw error;
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: LoginRequest = req.body;
      const result = await this.authService.loginUser(credentials);

      const response: ApiResponse<LoginResponse> = {
        success: true,
        data: result,
        message: 'Login successful',
      };

      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email or password') {
        throw createError('Invalid email or password', 401);
      }
      throw error;
    }
  };


}
