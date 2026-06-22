require('dotenv/config');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const users = [
  { email: 'j.wilson@medcrm.com',  firstName: 'James',   lastName: 'Wilson',   phone: '+1 555-0101', bio: 'Board-certified cardiologist with 12 years of clinical experience.',                          createdAt: '2023-02-15T09:00:00Z' },
  { email: 'a.okafor@medcrm.com',  firstName: 'Amara',   lastName: 'Okafor',   phone: '+1 555-0102', bio: 'Dermatologist focused on medical and cosmetic dermatology.',                                  createdAt: '2023-04-01T10:30:00Z' },
  { email: 'r.patel@medcrm.com',   firstName: 'Raj',     lastName: 'Patel',    phone: '+1 555-0103', bio: 'Neurologist specializing in epilepsy and movement disorders.',                                createdAt: '2022-11-20T08:00:00Z' },
  { email: 'l.park@medcrm.com',    firstName: 'Lisa',    lastName: 'Park',     phone: '+1 555-0104', bio: 'Pediatrician dedicated to comprehensive care for children from newborns to adolescents.',     createdAt: '2023-07-12T07:30:00Z' },
  { email: 'm.santos@medcrm.com',  firstName: 'Maria',   lastName: 'Santos',   phone: '+1 555-0105', bio: 'Orthopedic surgeon focused on sports medicine and joint replacement.',                        createdAt: '2022-08-30T12:00:00Z' },
  { email: 'h.larsson@medcrm.com', firstName: 'Henrik',  lastName: 'Larsson',  phone: '+1 555-0106', bio: 'General practitioner with a holistic approach to chronic disease management.',               createdAt: '2021-05-18T09:45:00Z' },
  { email: 'y.tanaka@medcrm.com',  firstName: 'Yuki',    lastName: 'Tanaka',   phone: '+1 555-0107', bio: 'Cardiologist with special interest in electrophysiology and arrhythmia management.',         createdAt: '2023-09-05T11:00:00Z' },
  { email: 'o.chen@medcrm.com',    firstName: 'Oliver',  lastName: 'Chen',     phone: '+1 555-0108', bio: null,                                                                                          createdAt: '2024-01-10T08:30:00Z' },
  { email: 's.miller@medcrm.com',  firstName: 'Sofia',   lastName: 'Miller',   phone: '+1 555-0109', bio: 'Registered nurse transitioning into clinical management.',                                    createdAt: '2024-03-22T11:15:00Z' },
  { email: 'k.nguyen@medcrm.com',  firstName: 'Kevin',   lastName: 'Nguyen',   phone: null,          bio: null,                                                                                          createdAt: '2025-01-05T09:00:00Z' },
  { email: 'n.ibrahim@medcrm.com', firstName: 'Nadia',   lastName: 'Ibrahim',  phone: '+1 555-0111', bio: 'Psychiatrist specializing in cognitive behavioral therapy and mood disorders.',               createdAt: '2024-06-18T10:00:00Z' },
  { email: 'd.kowalski@medcrm.com',firstName: 'Daniel',  lastName: 'Kowalski', phone: '+1 555-0112', bio: null,                                                                                          createdAt: '2025-02-28T14:00:00Z' },
];

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const hash = await bcrypt.hash('password123', 10);

  let created = 0;
  let skipped = 0;

  for (const u of users) {
    const exists = await client.query('SELECT id FROM users WHERE email = $1', [u.email]);
    if (exists.rows.length > 0) {
      console.log(`skip  ${u.email}`);
      skipped++;
      continue;
    }
    await client.query(
      `INSERT INTO users (id, email, password, first_name, last_name, phone, bio, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $7)`,
      [u.email, hash, u.firstName, u.lastName, u.phone, u.bio, u.createdAt],
    );
    console.log(`added ${u.email}`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
