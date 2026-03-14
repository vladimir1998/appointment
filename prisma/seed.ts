import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEFAULT_PERMISSIONS = [
  { name: 'create service', value: 'service:create' },
  { name: 'read service', value: 'service:read' },
  { name: 'update service', value: 'service:update' },
  { name: 'delete service', value: 'service:delete' },
  { name: 'assigne service', value: 'service:assigne' },
  { name: 'create employee', value: 'employee:create' },
  { name: 'read employee', value: 'employee:read' },
  { name: 'update employee', value: 'employee:update' },
  { name: 'delete employee', value: 'employee:delete' },
  { name: 'create appointment', value: 'appointment:create' },
  { name: 'read appointment', value: 'appointment:read' },
  { name: 'update appointment', value: 'appointment:update' },
  { name: 'delete appointment', value: 'appointment:delete' },
];

async function main() {
  for (const p of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { value: p.value },
      create: p,
      update: { name: p.name },
    });
  }
  console.log(`Seeded ${DEFAULT_PERMISSIONS.length} default permissions`);

  const email = 'superadmin@shedul.com';
  const password = 'superadmin123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Superadmin already exists: ${email}`);
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      globalRole: 'OWNER',
    },
  });

  console.log('Superadmin created:');
  console.log(`  email:    ${user.email}`);
  console.log(`  password: ${password}`);
  console.log(`  role:     ${user.globalRole}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
