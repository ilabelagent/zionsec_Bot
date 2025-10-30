#!/usr/bin/env node
/**
 * Validate that an environment file does not contain obvious placeholders.
 *
 * Usage:
 *   node scripts/validate-env.js [.env.production]
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const [, , fileArg] = process.argv;
const envPath = resolve(process.cwd(), fileArg ?? ".env.production");

let raw;
try {
  raw = readFileSync(envPath, "utf-8");
} catch (error) {
  console.error(`❌ Unable to read env file at ${envPath}`);
  process.exit(1);
}

const placeholderPatterns = [
  /<.+>/, // angle-bracket placeholders
  /\b(change|replace|todo)\b/i,
  /\byour[-_]/i,
  /\bNOT_SET\b/,
  /\bexample\b/i,
  /\bplaceholder\b/i,
  /\bdev(_ONLY)?\b/i,
];

const failures = [];

for (const line of raw.split(/\r?\n/)) {
  if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;

  const [key, ...rest] = line.split("=");
  const value = rest.join("=").trim();

  if (!value) {
    failures.push({ key: key.trim(), value: "(empty)" });
    continue;
  }

  if (placeholderPatterns.some((regex) => regex.test(value))) {
    failures.push({ key: key.trim(), value });
  }
}

if (failures.length) {
  console.error("❌ Placeholder or empty values detected:\n");
  for (const { key, value } of failures) {
    console.error(`  - ${key} = ${value}`);
  }
  console.error(
    "\nReplace these entries with production credentials before continuing."
  );
  process.exit(1);
}

console.log(`✅ ${envPath} looks ready for production.`);
