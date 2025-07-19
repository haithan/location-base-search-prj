import { UserModel } from '../../../src/models/User';
import { UserRepository } from '../../../src/repositories/UserRepository';
import { AppDataSource } from '../../../src/config/database';

jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/config/database');

describe('UserModel', () => {
  let userModel: UserModel;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockTypeOrmRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      validatePassword: jest.fn(),
      findWithFavorites: jest.fn(),
    } as any;

    (mockUserRepository as any)['repository'] = mockTypeOrmRepository;

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTypeOrmRepository);

    (UserRepository as jest.MockedClass<typeof UserRepository>).mockImplementation(() => mockUserRepository);

    userModel = new UserModel();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockResolvedValue(mockUser as any);

      const result = await userModel.create(userData);

      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user creation fails', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.create.mockRejectedValue(new Error('Failed to create user'));

      await expect(userModel.create(userData)).rejects.toThrow('Failed to create user');
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser as any);

      const result = await userModel.findById(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await userModel.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);

      const result = await userModel.findByEmail('test@example.com');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', async () => {
      mockUserRepository.validatePassword.mockResolvedValue(true);

      const result = await userModel.validatePassword('password123', 'hashedpassword');

      expect(mockUserRepository.validatePassword).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      mockUserRepository.validatePassword.mockResolvedValue(false);

      const result = await userModel.validatePassword('wrongpassword', 'hashedpassword');

      expect(mockUserRepository.validatePassword).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true if user exists', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(1);

      const result = await userModel.exists('test@example.com', 'testuser');

      expect(mockTypeOrmRepository.count).toHaveBeenCalledWith({
        where: [
          { email: 'test@example.com' },
          { username: 'testuser' }
        ]
      });
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(0);

      const result = await userModel.exists('test@example.com', 'testuser');

      expect(result).toBe(false);
    });
  });
});
