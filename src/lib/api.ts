import { getDb, type DbUser, type DbGrocery } from './database';
import { hashPassword, verifyPassword } from './auth';
import type { User, Grocery, GroceryInput, GroceryCategory } from './types';

const SESSION_KEY = 'fungro_session';

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  const db = await getDb();

  const existing = await db.query<DbUser>(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (existing.rows.length > 0) {
    return { user: null, error: 'An account with this email already exists.' };
  }

  const hash = await hashPassword(password);
  const result = await db.query<DbUser>(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [name.trim(), email.toLowerCase(), hash]
  );
  const row = result.rows[0];
  const user = toUser(row);
  saveSession(user);
  return { user, error: null };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  const db = await getDb();
  const result = await db.query<DbUser>(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (result.rows.length === 0) {
    return { user: null, error: 'No account found with this email.' };
  }
  const row = result.rows[0];
  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) {
    return { user: null, error: 'Incorrect password.' };
  }
  const user = toUser(row);
  saveSession(user);
  return { user, error: null };
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): User | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function saveSession(user: User): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function toUser(row: DbUser): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  };
}

// ---- Grocery CRUD ----

export async function listGroceries(userId: number): Promise<Grocery[]> {
  const db = await getDb();
  const result = await db.query<DbGrocery>(
    'SELECT * FROM groceries WHERE user_id = $1 ORDER BY purchased ASC, created_at DESC',
    [userId]
  );
  return result.rows.map(toGrocery);
}

export async function createGrocery(
  userId: number,
  input: GroceryInput
): Promise<Grocery> {
  const db = await getDb();
  const result = await db.query<DbGrocery>(
    `INSERT INTO groceries (user_id, name, category, quantity, unit, price)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      userId,
      input.name.trim(),
      input.category,
      input.quantity,
      input.unit,
      input.price,
    ]
  );
  return toGrocery(result.rows[0]);
}

export async function updateGrocery(
  id: number,
  input: Partial<GroceryInput> & { purchased?: boolean }
): Promise<Grocery | null> {
  const db = await getDb();
  const sets: string[] = [];
  const values: (string | number | boolean)[] = [];
  let paramIdx = 1;

  if (input.name !== undefined) {
    sets.push(`name = $${paramIdx++}`);
    values.push(input.name.trim());
  }
  if (input.category !== undefined) {
    sets.push(`category = $${paramIdx++}`);
    values.push(input.category);
  }
  if (input.quantity !== undefined) {
    sets.push(`quantity = $${paramIdx++}`);
    values.push(input.quantity);
  }
  if (input.unit !== undefined) {
    sets.push(`unit = $${paramIdx++}`);
    values.push(input.unit);
  }
  if (input.price !== undefined) {
    sets.push(`price = $${paramIdx++}`);
    values.push(input.price);
  }
  if (input.purchased !== undefined) {
    sets.push(`purchased = $${paramIdx++}`);
    values.push(input.purchased);
  }

  if (sets.length === 0) return null;
  sets.push(`updated_at = now()`);
  values.push(id);

  const result = await db.query<DbGrocery>(
    `UPDATE groceries SET ${sets.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
    values
  );
  return result.rows.length > 0 ? toGrocery(result.rows[0]) : null;
}

export async function deleteGrocery(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.query<DbGrocery>(
    'DELETE FROM groceries WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows.length > 0;
}

function toGrocery(row: DbGrocery): Grocery {
  return {
    id: row.id,
    name: row.name,
    category: row.category as GroceryCategory,
    quantity: row.quantity,
    unit: row.unit,
    price: Number(row.price),
    purchased: row.purchased,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
