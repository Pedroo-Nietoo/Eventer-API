import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@users/entities/user.entity';
import { Event } from '@events/entities/event.entity';
import { TicketType } from '@ticket-types/entities/ticket-type.entity';
import { Order } from '@orders/entities/order.entity';
import { Ticket, TicketStatus } from '@tickets/entities/ticket.entity';
import { UserRole } from '@common/enums/role.enum';
import { OrderStatus } from '@common/enums/order-status.enum';
import dataSource from './data-source.config';

async function runSeed() {
 console.log('🌱 Iniciando o Seeder...');

 try {
  await dataSource.initialize();
  console.log('✅ Banco de dados conectado.');

  console.log('🧹 Limpando o banco de dados...');
  await dataSource.query('TRUNCATE TABLE "tickets" CASCADE;');
  await dataSource.query('TRUNCATE TABLE "orders" CASCADE;');
  await dataSource.query('TRUNCATE TABLE "ticket_types" CASCADE;');
  await dataSource.query('TRUNCATE TABLE "events" CASCADE;');
  await dataSource.query('TRUNCATE TABLE "users" CASCADE;');

  const userRepo = dataSource.getRepository(User);
  const eventRepo = dataSource.getRepository(Event);
  const ticketTypeRepo = dataSource.getRepository(TicketType);
  const orderRepo = dataSource.getRepository(Order);
  const ticketRepo = dataSource.getRepository(Ticket);

  const defaultPassword = await bcrypt.hash('Senha123!', 10);

  /* -------------------------------------------------------------------------- */
  /*    POPULAR USUÁRIOS                                                        */
  /* -------------------------------------------------------------------------- */
  console.log('👤 Criando usuários...');

  const adminUser = userRepo.create({
   username: 'Admin Root',
   email: 'admin@nearby.com',
   password: defaultPassword,
   role: UserRole.ADMIN,
  });

  const organizerUser = userRepo.create({
   username: 'Produtora Eventos LTDA',
   email: 'contato@produtora.com',
   password: defaultPassword,
   role: UserRole.EVENT_CREATOR,
  });

  const commonUser = userRepo.create({
   username: 'João Comprador',
   email: 'joao@gmail.com',
   password: defaultPassword,
   role: UserRole.USER,
  });

  await userRepo.save([adminUser, organizerUser, commonUser]);

  /* -------------------------------------------------------------------------- */
  /*    POPULAR EVENTOS                                                         */
  /* -------------------------------------------------------------------------- */
  console.log('📅 Criando eventos...');

  const mainEvent = eventRepo.create({
   title: 'Nearby Tech Summit 2026',
   slug: 'nearby-tech-summit-2026',
   description: 'O maior evento de tecnologia e startups da região.',
   coverImageUrl: 'https://exemplo.com/imagem-evento.jpg',
   eventDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
   organizer: organizerUser,
   location: {
    type: 'Point',
    coordinates: [-46.6562, -23.5614], // Exemplo: Av. Paulista, SP
   },
  });

  await eventRepo.save(mainEvent);

  /* -------------------------------------------------------------------------- */
  /*    POPULAR TIPOS DE INGRESSOS (TICKET TYPES)                               */
  /* -------------------------------------------------------------------------- */
  console.log('🎟️ Criando tipos de ingressos...');

  const ticketTypeVip = ticketTypeRepo.create({
   name: 'VIP',
   description: 'Acesso completo com open bar e networking.',
   price: 350.00,
   totalQuantity: 100,
   availableQuantity: 99,
   event: mainEvent,
  });

  const ticketTypeRegular = ticketTypeRepo.create({
   name: 'Pista Comum',
   description: 'Acesso padrão ao evento e palestras.',
   price: 100.00,
   totalQuantity: 500,
   availableQuantity: 500,
   event: mainEvent,
  });

  await ticketTypeRepo.save([ticketTypeVip, ticketTypeRegular]);

  /* -------------------------------------------------------------------------- */
  /*    POPULAR PEDIDOS (ORDERS)                                                */
  /* -------------------------------------------------------------------------- */
  console.log('🛒 Criando pedidos...');

  const order = orderRepo.create({
   stripeSessionId: 'cs_test_' + uuidv4().replace(/-/g, '').substring(0, 24),
   status: OrderStatus.PAID,
   user: commonUser,
   ticketType: ticketTypeVip,
   quantity: 1,
   unitPrice: 350.00,
   totalPrice: 350.00,
  });

  await orderRepo.save(order);

  /* -------------------------------------------------------------------------- */
  /*    POPULAR INGRESSOS COMPRADOS (TICKETS)                                   */
  /* -------------------------------------------------------------------------- */
  console.log('🎫 Gerando ingressos físicos/virtuais...');

  const ticket = ticketRepo.create({
   qrCode: uuidv4(),
   status: TicketStatus.VALID,
   user: commonUser,
   ticketType: ticketTypeVip,
   purchasePrice: 350.00,
  });

  await ticketRepo.save(ticket);

  console.log('🎉 Seeding concluído com sucesso!');
  console.log(`
      Credenciais para teste:
      Admin: admin@nearby.com / Senha123!
      Organizador: contato@produtora.com / Senha123!
      Comum: joao@gmail.com / Senha123!
    `);

 } catch (error) {
  console.error('❌ Erro durante o seeding:', error);
 } finally {
  if (dataSource.isInitialized) {
   await dataSource.destroy();
  }
 }
}

runSeed();