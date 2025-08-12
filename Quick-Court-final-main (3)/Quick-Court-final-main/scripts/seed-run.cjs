// Wrapper to run TypeScript seed in Windows PowerShell reliably
// Usage: node scripts/seed-run.cjs
process.env.TS_NODE_PROJECT = process.env.TS_NODE_PROJECT || 'tsconfig.seed.json';
require('ts-node/register/transpile-only');
// Removed tsconfig-paths/register (not installed and paths not needed for relative imports)
require('./seed.ts');
