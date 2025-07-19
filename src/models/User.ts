import { UserRepository } from '../repositories/UserRepository';
import { User as UserEntity } from '../entities/User';
import { CreateUserRequest } from '../types';

export class UserModel {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async create(userData: CreateUserRequest): Promise<UserEntity> {
    return await this.userRepository.create(userData);
  }

  async findById(id: number): Promise<UserEntity | null> {
    return await this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return await this.userRepository.findByUsername(username);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await this.userRepository.validatePassword(plainPassword, hashedPassword);
  }



  async findWithFavorites(userId: number): Promise<UserEntity | null> {
    return await this.userRepository.findWithFavorites(userId);
  }

  async delete(id: number): Promise<void> {
    const repository = this.userRepository['repository'];
    await repository.delete(id);
  }

  async exists(email: string, username: string): Promise<boolean> {
    const repository = this.userRepository['repository'];
    const count = await repository.count({
      where: [
        { email },
        { username }
      ]
    });
    return count > 0;
  }
}
