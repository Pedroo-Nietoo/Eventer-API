import { Event } from '@events/entities/event.entity';
import { Order } from '@orders/entities/order.entity';
import { TicketType } from '@ticket-types/entities/ticket-type.entity';
import { Ticket } from '@tickets/entities/ticket.entity';
import { User } from '@users/entities/user.entity';
import { DataSource } from 'typeorm';

describe('Database Migrations (Integration)', () => {
 let dataSource: DataSource;

 beforeAll(async () => {
  dataSource = new DataSource({
   type: 'postgres',
   host: 'localhost',
   port: 5433,
   username: 'postgres',
   password: 'postgres',
   database: 'events_test_db',
   entities: [Event, User, Order, Ticket, TicketType],
   migrations: [
    'src/infra/database/migrations/*.ts',
   ],
   logging: false,
  });

  await dataSource.initialize();
 });

 afterAll(async () => {
  if (dataSource.isInitialized) {
   await dataSource.destroy();
  }
 });

 it('deve executar todas as migrations com sucesso (UP)', async () => {
  const executedMigrations = await dataSource.runMigrations();

  expect(executedMigrations.length).toBeGreaterThan(0);

  const lastMigration = executedMigrations[executedMigrations.length - 1];
  expect(lastMigration.name).toContain('FixTimestampWithTimeZone');
 });

 it('deve garantir que o schema gerado pelas migrations bate com as Entities', async () => {
  const expectedQueries = await dataSource.driver.createSchemaBuilder().log();

  expect(expectedQueries.upQueries.length).toBe(0);
 });

 it('deve ser capaz de reverter a última migration (DOWN)', async () => {
  await dataSource.undoLastMigration();

  const redo = await dataSource.runMigrations();
  expect(redo).toBeDefined();
 });
});