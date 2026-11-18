const { randomBytes, scryptSync } = require('node:crypto');
const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: node scripts/hash-password.js "a-strong-password" (minimum 12 characters)');
  process.exit(1);
}
const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');
console.log(`${salt}:${hash}`);
