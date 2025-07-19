process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'location_search_test_db';

import 'reflect-metadata';
import 'dotenv/config';
import mysql from 'mysql2/promise';
import { AppDataSource } from '../src/config/database';

const setupTestDatabase = async (): Promise<void> => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    const testDbName = 'location_search_test_db';

    // Drop database if exists
    await connection.execute(`DROP DATABASE IF EXISTS \`${testDbName}\``);
    console.log(`Test database '${testDbName}' dropped`);

    // Create database
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${testDbName}\``);
    console.log(`Test database '${testDbName}' created`);
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  } finally {
    await connection.end();
  }
};

export default async (): Promise<void> => {
  try {
    console.log('Running global test setup...');

    await setupTestDatabase();

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    await AppDataSource.runMigrations();

    console.log('Global test setup completed successfully');
  } catch (error) {
    console.error('Global test setup failed:', error);
    throw error;
  }
};
