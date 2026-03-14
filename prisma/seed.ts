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

const SUPERADMIN_ORG_NAME = 'System';
const SUPERADMIN_POSITION_NAME = 'Superadmin';

async function main() {
  const permissions: { id: string }[] = [];
  for (const p of DEFAULT_PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { value: p.value },
      create: p,
      update: { name: p.name },
    });
    permissions.push(perm);
  }
  console.log(`Seeded ${DEFAULT_PERMISSIONS.length} default permissions`);

  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: SUPERADMIN_ORG_NAME,
    },
    update: {},
  });

  const superadminPosition = await prisma.position.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: SUPERADMIN_POSITION_NAME,
      organizationId: org.id,
      permissions: { connect: permissions.map((p) => ({ id: p.id })) },
    },
    update: {
      permissions: { set: permissions.map((p) => ({ id: p.id })) },
    },
  });

  const email = 'superadmin@shedul.com';
  const password = 'superadmin123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { globalPositionId: superadminPosition.id },
    });
    console.log(`Superadmin already exists: ${email}, globalPosition updated`);
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      globalPositionId: superadminPosition.id,
    },
  });

  console.log('Superadmin created:');
  console.log(`  email:    ${user.email}`);
  console.log(`  password: ${password}`);
  console.log(`  position: ${SUPERADMIN_POSITION_NAME} (all permissions)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
