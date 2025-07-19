import { UserModel } from '../models/User';
import { generateToken } from '../middleware/auth';
import { CreateUserRequest, LoginRequest, LoginResponse } from '../types';

export class AuthService {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  async registerUser(userData: CreateUserRequest): Promise<LoginResponse> {
    const existingUser = await this.userModel.exists(userData.email, userData.username);
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const user = await this.userModel.create(userData);

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async loginUser(credentials: LoginRequest): Promise<LoginResponse> {
    const { email, password } = credentials;

    const user = await this.userModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await this.userModel.validatePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }


}
