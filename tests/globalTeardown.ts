process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'location_search_test_db';

import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';

export default async (): Promise<void> => {
  try {
    console.log('Running global test teardown...');

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    console.log('Global test teardown completed successfully');
  } catch (error) {
    console.error('Global test teardown failed:', error);
  }
};
