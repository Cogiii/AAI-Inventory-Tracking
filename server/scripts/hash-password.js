/**
 * Password Hashing Script
 *
 * Usage: node scripts/hash-password.js <password>
 * Example: node scripts/hash-password.js mySecurePassword123
 */

const { hashPassword } = require('../utils/password');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.js <password>');
  console.error('Example: node scripts/hash-password.js mySecurePassword123');
  process.exit(1);
}

(async () => {
  try {
    const hashedPassword = await hashPassword(password);
    console.log('\nPassword Hash Generated:');
    console.log('========================');
    console.log(hashedPassword);
    console.log('');
  } catch (error) {
    console.error('Error hashing password:', error.message);
    process.exit(1);
  }
})();
