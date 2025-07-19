// Set test environment FIRST before any imports
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'location_search_test_db';

import 'reflect-metadata';

jest.setTimeout(30000);

if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
