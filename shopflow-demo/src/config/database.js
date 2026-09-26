import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const schemaPath = resolve(projectRoot, 'src/db/schema.sql');
let connection;

export function getDatabase() {
  if (connection) return connection;

  const configuredPath = process.env.SHOPFLOW_DB_PATH || './data/shopflow.sqlite';
  const databasePath = configuredPath === ':memory:'
    ? configuredPath
    : resolve(projectRoot, configuredPath);

  if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true });
  connection = new Database(databasePath);
  connection.pragma('foreign_keys = ON');
  connection.pragma('journal_mode = WAL');
  return connection;
}

export function initializeDatabase() {
  const database = getDatabase();
  database.exec(readFileSync(schemaPath, 'utf8'));
  return database;
}

export function closeDatabase() {
  connection?.close();
  connection = undefined;
}