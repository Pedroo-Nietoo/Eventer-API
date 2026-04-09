import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({ path: '.env.test' });

export const TestDataSource = new DataSource({
 type: 'postgres',
 host: 'localhost',
 port: 5433,
 username: 'postgres',
 password: 'postgres',
 database: 'events_test_db',
 entities: ['src/**/*.entity.ts'],
 migrations: ['src/infra/database/migrations/*.ts'],
 logging: false,
});