import assert from 'node:assert/strict';
import { before, after, beforeEach, afterEach, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Real PostgreSQL RLS/triggers, without a running Supabase service. Only
// auth.users and auth.uid() are stand-ins for Supabase's authentication layer.
const db = new PGlite();
const customer = '00000000-0000-0000-0000-000000000001';
const planner = '00000000-0000-0000-0000-000000000002';
const admin = '00000000-0000-0000-0000-000000000003';
const newcomer = '00000000-0000-0000-0000-000000000004';

async function migrate(name) {
  await db.exec(await readFile(new URL(`../migrations/${name}.sql`, import.meta.url), 'utf8'));
}

async function asUser(id, role = 'authenticated') {
  assert.ok(['authenticated', 'anon', 'service_role'].includes(role));
  await db.exec(`set local role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub', $1, true)", [id]);
}

async function denied(sql) {
  await db.exec('savepoint denied_write');
  await assert.rejects(db.exec(sql), (error) => error.code === '42501');
  await db.exec('rollback to savepoint denied_write');
}

before(async () => {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated, service_role;
  `);
  // Load the real account schema, grants, participant policies and admin API.
  for (const name of ['0001_init', '0002_rls', '0003_grants_and_rls_fix',
    '0004_profile_visibility', '0016_admin_role']) await migrate(name);
  await db.exec(`
    grant usage on schema public to service_role;
    grant all on all tables in schema public to service_role;
    insert into auth.users(id) values ('${customer}'), ('${planner}'), ('${admin}'), ('${newcomer}');
    insert into profiles(id, role, full_name, is_admin) values
      ('${customer}', 'customer', 'Customer', false),
      ('${planner}', 'planner', 'Planner', false),
      ('${admin}', 'customer', 'Admin', true);
    insert into planners(user_id, business_name, city) values ('${planner}', 'Business', 'riyadh');
  `);

  // Confirm these fixtures reproduce both original vulnerabilities before
  // installing the fix. Roll back so no elevated test user survives.
  await db.exec('begin');
  await asUser(customer);
  await db.exec(`update profiles set is_admin = true where id = '${customer}'`);
  assert.equal((await db.query('select public.is_admin() as value')).rows[0].value, true);
  await db.exec('rollback; begin');
  await asUser(planner);
  const result = await db.query(`update planners set verified = true where user_id = '${planner}' returning verified`);
  assert.equal(result.rows[0].verified, true);
  await db.exec('rollback');
  await migrate('0025_protect_account_permissions');
});

beforeEach(() => db.exec('begin'));
afterEach(() => db.exec('rollback'));
after(() => db.close());

test('customer and planner cannot promote themselves', async () => {
  for (const id of [customer, planner]) {
    await asUser(id);
    await denied(`update profiles set is_admin = true where id = '${id}'`);
    assert.equal((await db.query('select public.is_admin() as value')).rows[0].value, false);
  }
});

test('first profile cannot insert administrator access', async () => {
  await asUser(newcomer);
  await denied(`insert into profiles(id, role, full_name, is_admin) values ('${newcomer}', 'customer', 'New', true)`);
});

test('upsert cannot promote an existing profile', async () => {
  await asUser(customer);
  await denied(`insert into profiles(id, role, full_name, is_admin)
    values ('${customer}', 'customer', 'Customer', true)
    on conflict (id) do update set is_admin = excluded.is_admin`);
  await denied(`insert into profiles(id, role, full_name)
    values ('${customer}', 'customer', 'Customer')
    on conflict (id) do update set is_admin = true`);
});

test('normal profile editing succeeds with unchanged protected fields', async () => {
  await asUser(customer);
  const result = await db.query(`update profiles set full_name = 'Updated', phone = '+966500000001',
    language = 'en', city = 'jeddah', is_admin = false, role = 'customer'
    where id = '${customer}' returning full_name`);
  assert.equal(result.rows[0].full_name, 'Updated');
});

test('ordinary users cannot change role or ownership', async () => {
  await asUser(customer);
  await denied(`update profiles set role = 'planner' where id = '${customer}'`);
  await denied(`update profiles set id = '${newcomer}' where id = '${customer}'`);
  await asUser(planner);
  await denied(`update planners set user_id = '${newcomer}' where user_id = '${planner}'`);
});

test('planner cannot self-verify through update or upsert', async () => {
  await asUser(planner);
  await denied(`update planners set verified = true where user_id = '${planner}'`);
  await denied(`insert into planners(user_id, business_name, city, verified)
    values ('${planner}', 'Business', 'riyadh', true)
    on conflict (user_id) do update set verified = excluded.verified`);
  await denied(`insert into planners(user_id, business_name, city)
    values ('${planner}', 'Business', 'riyadh')
    on conflict (user_id) do update set verified = true`);
});

test('new planner cannot insert a pre-verified storefront', async () => {
  await asUser(newcomer);
  await db.exec(`insert into profiles(id, role, full_name) values ('${newcomer}', 'planner', 'New planner')`);
  await denied(`insert into planners(user_id, business_name, city, verified)
    values ('${newcomer}', 'Business', 'riyadh', true)`);
});

test('customer onboarding retains safe defaults', async () => {
  await asUser(newcomer);
  const result = await db.query(`insert into profiles(id, role, full_name)
    values ('${newcomer}', 'customer', 'New customer') returning is_admin`);
  assert.equal(result.rows[0].is_admin, false);
});

test('planner onboarding retains safe defaults', async () => {
  await asUser(newcomer);
  let result = await db.query(`insert into profiles(id, role, full_name)
    values ('${newcomer}', 'planner', 'New planner') returning is_admin`);
  assert.equal(result.rows[0].is_admin, false);
  result = await db.query(`insert into planners(user_id, business_name, city)
    values ('${newcomer}', 'Business', 'riyadh') returning verified`);
  assert.equal(result.rows[0].verified, false);
});

test('verified planner can edit storefront but cannot revoke verification', async () => {
  await asUser(admin);
  await db.exec(`update planners set verified = true where user_id = '${planner}'`);
  await asUser(planner);
  const result = await db.query(`update planners set business_name = 'Updated', bio = 'New bio', verified = true
    where user_id = '${planner}' returning business_name, verified`);
  assert.deepEqual(result.rows, [{ business_name: 'Updated', verified: true }]);
  await denied(`update planners set verified = false where user_id = '${planner}'`);
});

test('admin can promote/demote users and approve/reject planners', async () => {
  await asUser(admin);
  for (const value of [true, false]) {
    const profile = await db.query(`update profiles set is_admin = ${value} where id = '${customer}' returning is_admin`);
    assert.equal(profile.rows[0].is_admin, value);
    const storefront = await db.query(`update planners set verified = ${value} where user_id = '${planner}' returning verified`);
    assert.equal(storefront.rows[0].verified, value);
  }
});

test('demoted administrator immediately loses privilege management', async () => {
  await asUser(admin);
  await db.exec(`update profiles set is_admin = false where id = '${admin}'`);
  await denied(`update profiles set is_admin = true where id = '${admin}'`);
});

test('trusted service role retains account provisioning', async () => {
  await asUser('', 'service_role');
  const result = await db.query(`update profiles set is_admin = true where id = '${customer}' returning is_admin`);
  assert.equal(result.rows[0].is_admin, true);
  await db.exec(`update planners set verified = true where user_id = '${planner}'`);
});

test('row policies still prevent editing another user', async () => {
  await asUser(customer);
  const result = await db.query(`update profiles set full_name = 'Tampered' where id = '${planner}' returning id`);
  assert.equal(result.rows.length, 0);
});

test('anonymous users cannot modify profiles', async () => {
  await asUser('', 'anon');
  await denied(`update profiles set is_admin = true where id = '${customer}'`);
});
