#!/usr/bin/env node

/**
 * Security secrets generator for production deployment
 * Generates JWT secret and secure passwords for authentication
 */

const crypto = require('crypto');

function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

function generateSecurePassword(length = 16) {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
}

function generateEnvTemplate() {
  const jwtSecret = generateSecureSecret(64);
  const adminPassword = generateSecurePassword(20);

  console.log('🔐 Generated Security Configuration');
  console.log('=====================================');
  console.log('');
  console.log('Add these to your .env file or environment variables:');
  console.log('');
  console.log('# Authentication Configuration');
  console.log(`AUTH_USERNAME=admin`);
  console.log(`AUTH_PASSWORD=${adminPassword}`);
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`SESSION_DURATION_MINUTES=25`);
  console.log('');
  console.log('⚠️  SECURITY WARNINGS:');
  console.log('- Never commit these secrets to version control');
  console.log('- Store them securely in your deployment platform');
  console.log('- Rotate them regularly');
  console.log('- Use different secrets for different environments');
  console.log('');
  console.log('📋 For copy-paste convenience:');
  console.log('');
  console.log('Environment Variables:');
  console.log(`export AUTH_USERNAME="admin"`);
  console.log(`export AUTH_PASSWORD="${adminPassword}"`);
  console.log(`export JWT_SECRET="${jwtSecret}"`);
  console.log(`export SESSION_DURATION_MINUTES="25"`);
  console.log('');
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Security Secrets Generator');
    console.log('');
    console.log('Usage: node scripts/generate-secrets.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h     Show this help message');
    console.log('  --jwt-only     Generate only JWT secret');
    console.log('  --password-only Generate only admin password');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/generate-secrets.js');
    console.log('  node scripts/generate-secrets.js --jwt-only');
    console.log('  npm run generate-secrets');
    process.exit(0);
  }

  if (args.includes('--jwt-only')) {
    console.log('JWT_SECRET=' + generateSecureSecret(64));
  } else if (args.includes('--password-only')) {
    console.log('AUTH_PASSWORD=' + generateSecurePassword(20));
  } else {
    generateEnvTemplate();
  }
}

module.exports = {
  generateSecureSecret,
  generateSecurePassword,
  generateEnvTemplate,
};
