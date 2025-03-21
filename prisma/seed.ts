import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Initializes an instance of the PrismaClient to interact with the database.
 * The PrismaClient provides methods for querying and mutating the database
 * using the Prisma ORM.
 *
 * @see https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
 */
const prisma = new PrismaClient();

/**
 * Seeds the database with initial data, including users, categories, and events.
 * 
 * This function performs the following operations:
 * - Creates or updates two users (a regular user and an admin) with hashed passwords.
 * - Creates or updates two categories (Music and Technology).
 * - Creates two events associated with the seeded users and categories.
 * 
 * Logs the progress and results of the seeding process to the console.
 * 
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the seeding process is complete.
 */
async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Abc123456', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'user1@example.com',
      password: passwordHash,
      birthDate: new Date('1995-06-15'),
      role: 'USER',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: passwordHash,
      birthDate: new Date('1990-01-01'),
      role: 'ADMIN',
    },
  });

  console.log('Users seeded:', { user1, user2 });

  const categoryMusic = await prisma.category.upsert({
    where: { id: 'music-category-id' },
    update: {},
    create: { id: 'music-category-id', name: 'Music' },
  });

  const categoryTech = await prisma.category.upsert({
    where: { id: 'tech-category-id' },
    update: {},
    create: { id: 'tech-category-id', name: 'Technology' },
  });

  console.log('Categories seeded:', { categoryMusic, categoryTech });

  const event1 = await prisma.event.create({
    data: {
      name: 'Rock Festival',
      slug: 'rock-festival',
      description: 'A great rock festival.',
      address: 'Rock Street, 123',
      latitude: -23.55052,
      longitude: -46.633308,
      date: new Date('2025-08-15T18:00:00Z'),
      phone: '555-1234',
      ticketCount: 500,
      customTickets: false,
      ticketDefaultPrice: 50.0,
      user: { connect: { id: user1.id } },
      category: { connect: { id: categoryMusic.id } },
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: 'Tech Conference 2025',
      slug: 'tech-conference-2025',
      description: 'The biggest tech event of the year.',
      address: 'Tech Avenue, 42',
      latitude: 37.7749,
      longitude: -122.4194,
      date: new Date('2025-09-20T09:00:00Z'),
      phone: '555-5678',
      ticketCount: 1000,
      customTickets: false,
      ticketDefaultPrice: 100.0,
      user: { connect: { id: user2.id } },
      category: { connect: { id: categoryTech.id } },
    },
  });

  console.log('Events seeded:', { event1, event2 });

  console.log('Seeding completed!');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });