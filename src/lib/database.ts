import { PGlite } from '@electric-sql/pglite';

let dbInstance: PGlite | null = null;

export async function getDb(): Promise<PGlite> {
  if (dbInstance) return dbInstance;

  dbInstance = new PGlite('idb://fungro-db');

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS groceries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Other',
      quantity INTEGER NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'pcs',
      price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      purchased BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_groceries_user_id ON groceries(user_id);
  `);

  return dbInstance;
}

export type DbUser = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export type DbGrocery = {
  id: number;
  user_id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  purchased: boolean;
  created_at: string;
  updated_at: string;
};
