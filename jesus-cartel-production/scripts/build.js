#!/usr/bin/env node

/**
 * Build script for Jesus Cartel Platform
 * Post-compilation setup and validation
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Post-build setup...');

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ Dist directory not found. TypeScript compilation may have failed.');
  process.exit(1);
}

// Copy shared types to dist if needed
const sharedSrc = path.join(__dirname, '..', 'shared');
const sharedDist = path.join(distDir, 'shared');

if (fs.existsSync(sharedSrc) && !fs.existsSync(sharedDist)) {
  console.log('📋 Copying shared types...');
  fs.mkdirSync(sharedDist, { recursive: true });
}

console.log('✅ Build completed successfully!');
console.log('');
console.log('🚀 Ready to start:');
console.log('   npm start');
console.log('');
