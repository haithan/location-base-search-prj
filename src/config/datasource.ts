import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User, AdministrativeDivision, ServiceType, Service, UserFavorite } from '../entities';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.NODE_ENV === 'test' ? 'location_search_test_db' : (process.env.DB_NAME || 'location_search_db'),
  charset: 'utf8mb4',
  synchronize: false,
  migrationsRun: process.env.NODE_ENV !== 'test',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    AdministrativeDivision,
    ServiceType,
    Service,
    UserFavorite
  ],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/database/subscribers/*.ts'],
});

export default AppDataSource;