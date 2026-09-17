// Lightweight password hashing using Web Crypto API (SHA-256 + salt)
// Not as strong as bcrypt, but works fully in-browser without external deps.

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const data = new Uint8Array([...salt, ...enc.encode(password)]);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const hashBytes = new Uint8Array(digest);
  return `sha256:${toHex(salt)}:${toHex(hashBytes)}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'sha256') return false;
  const salt = fromHex(parts[1]);
  const enc = new TextEncoder();
  const data = new Uint8Array([...salt, ...enc.encode(password)]);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(new Uint8Array(digest)) === parts[2];
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
}

export { hashPassword, verifyPassword };
