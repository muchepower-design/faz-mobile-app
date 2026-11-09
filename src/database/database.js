// src/database/database.js
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);
let db;

export async function initDatabase() {
  db = await SQLite.openDatabase({ name: 'fazscanner.db', location: 'default' });

  // 1. Run PRAGMA separately (it returns a row, cannot be batched)
  await db.executeSql('PRAGMA journal_mode=WAL;');

  // 2. Define tables as an array of strings
  const tables = [
    `CREATE TABLE IF NOT EXISTS tickets(
      id             TEXT PRIMARY KEY,
      ticket_number  TEXT NOT NULL,
      short_code     TEXT NOT NULL,
      ticket_type    TEXT,
      section        TEXT,
      row            TEXT,
      seat           TEXT,
      is_used        INTEGER NOT NULL DEFAULT 0,
      used_at        TEXT,
      downloaded_at  TEXT NOT NULL
    );`,
    `CREATE INDEX IF NOT EXISTS idx_tickets_short ON tickets(short_code);`,
    `CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(ticket_number);`,
    
    `CREATE TABLE IF NOT EXISTS accreditations(
      id                          TEXT PRIMARY KEY,
      qr_token                    TEXT NOT NULL,
      full_name                   TEXT NOT NULL,
      category                    TEXT NOT NULL,
      category_label              TEXT,
      service_provider_type       TEXT,
      service_provider_type_label TEXT,
      organization                TEXT,
      passport_photo_url          TEXT,
      nationality_name            TEXT,
      is_checked_in               INTEGER NOT NULL DEFAULT 0,
      checked_in_at               TEXT,
      downloaded_at               TEXT NOT NULL
    );`,
    `CREATE INDEX IF NOT EXISTS idx_accr_token ON accreditations(qr_token);`,
    
    `CREATE TABLE IF NOT EXISTS checkins(
      local_id       TEXT PRIMARY KEY,
      kind           TEXT NOT NULL,
      target_id      TEXT NOT NULL,
      holder_name    TEXT,
      method         TEXT NOT NULL,
      scanned_at     TEXT NOT NULL,
      sync_status    TEXT NOT NULL
    );`,
    `CREATE INDEX IF NOT EXISTS idx_checkins_status ON checkins(sync_status);`,
    `CREATE INDEX IF NOT EXISTS idx_checkins_target ON checkins(target_id);`,
    
    `CREATE TABLE IF NOT EXISTS settings(
      key   TEXT PRIMARY KEY,
      value TEXT
    );`
  ];

  // 3. Execute them sequentially
  for (const sql of tables) {
    await db.executeSql(sql);
  }
}

export function database() {
  if (!db) throw new Error('Database is not initialised');
  return db;
}

export async function setSetting(key, value) {
  await database().executeSql(
    'INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)',
    [key, value == null ? '' : String(value)],
  );
}

export async function getSetting(key) {
  const [r] = await database().executeSql(
    'SELECT value FROM settings WHERE key=?', [key],
  );
  return r.rows.length ? r.rows.item(0).value : null;
}

export async function clearAllData() {
  await database().executeSql(
    'DELETE FROM tickets; DELETE FROM accreditations; DELETE FROM checkins; DELETE FROM settings;',
  );
}