// src/database/repository.js
import { database } from './database';

// ──────────────────────────────────────────────────────────────────────
// TICKETS
// ──────────────────────────────────────────────────────────────────────
export async function saveTicket(t) {
  await database().executeSql(
    `INSERT OR REPLACE INTO tickets(
       id, ticket_number, short_code, ticket_type, section, row, seat,
       is_used, used_at, downloaded_at
     ) VALUES(?,?,?,?,?,?,?,?,?,?)`,
    [
      t.id,
      t.ticket_number,
      t.short_code,
      t.ticket_type || null,
      t.section || null,
      t.row || null,
      t.seat || null,
      t.is_used ? 1 : 0,
      t.used_at || null,
      new Date().toISOString(),
    ],
  );
}

export async function findTicketById(id) {
  const [r] = await database().executeSql(
    'SELECT * FROM tickets WHERE id=? LIMIT 1', [id],
  );
  return r.rows.length ? r.rows.item(0) : null;
}

export async function findTicketByNumber(number) {
  // short_code and ticket_number are stored exactly as issued.
  // Normalized input is uppercased; the short_code column retains
  // its mixed base62 case. Compare case-insensitively with LOWER().
  const s = String(number || '').toLowerCase();
  const [r] = await database().executeSql(
    `SELECT * FROM tickets
       WHERE LOWER(ticket_number) = ?
          OR LOWER(short_code)    = ?
       LIMIT 1`,
    [s, s],
  );
  return r.rows.length ? r.rows.item(0) : null;
}

export async function markTicketUsedLocally(id) {
  await database().executeSql(
    "UPDATE tickets SET is_used=1, used_at=? WHERE id=? AND is_used=0",
    [new Date().toISOString(), id],
  );
}

export async function ticketCount() {
  const [r] = await database().executeSql('SELECT COUNT(*) total FROM tickets');
  return r.rows.item(0).total;
}

// ──────────────────────────────────────────────────────────────────────
// ACCREDITATIONS
// ──────────────────────────────────────────────────────────────────────
export async function saveAccreditation(a) {
  await database().executeSql(
    `INSERT OR REPLACE INTO accreditations(
       id, qr_token, full_name, category, category_label,
       service_provider_type, service_provider_type_label,
       organization, passport_photo_url, nationality_name,
       is_checked_in, checked_in_at, downloaded_at
     ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      a.id,
      a.qr_token,
      a.full_name,
      a.category,
      a.category_label || null,
      a.service_provider_type || null,
      a.service_provider_type_label || null,
      a.organization || null,
      a.passport_photo_url || null,
      a.nationality_name || null,
      a.is_checked_in ? 1 : 0,
      a.checked_in_at || null,
      new Date().toISOString(),
    ],
  );
}

export async function findAccreditationByToken(token) {
  const s = String(token || '').toLowerCase();
  const [r] = await database().executeSql(
    `SELECT * FROM accreditations
       WHERE LOWER(qr_token) = ?
       LIMIT 1`,
    [s],
  );
  return r.rows.length ? r.rows.item(0) : null;
}

export async function findAccreditationById(id) {
  const s = String(id || '').toLowerCase();
  const [r] = await database().executeSql(
    `SELECT * FROM accreditations
       WHERE LOWER(id) = ?
       LIMIT 1`,
    [s],
  );
  return r.rows.length ? r.rows.item(0) : null;
}

export async function markAccreditationCheckedInLocally(id) {
  await database().executeSql(
    "UPDATE accreditations SET is_checked_in=1, checked_in_at=? WHERE id=? AND is_checked_in=0",
    [new Date().toISOString(), id],
  );
}

export async function accreditationCount() {
  const [r] = await database().executeSql('SELECT COUNT(*) total FROM accreditations');
  return r.rows.item(0).total;
}

// ──────────────────────────────────────────────────────────────────────
// CHECK-INS (local log)
// ──────────────────────────────────────────────────────────────────────
export async function saveCheckin(c) {
  await database().executeSql(
    `INSERT OR REPLACE INTO checkins(
       local_id, kind, target_id, holder_name,
       method, scanned_at, sync_status
     ) VALUES(?,?,?,?,?,?,?)`,
    [
      c.local_id,
      c.kind,
      c.target_id,
      c.holder_name || null,
      c.method,
      c.scanned_at,
      c.sync_status || 'pending',
    ],
  );
}

export async function pendingCheckins(limit = 500) {
  const [r] = await database().executeSql(
    "SELECT * FROM checkins WHERE sync_status='pending' ORDER BY scanned_at LIMIT ?",
    [limit],
  );
  return Array.from({ length: r.rows.length }, (_, i) => r.rows.item(i));
}

export async function updateCheckinStatus(local_id, status) {
  await database().executeSql(
    'UPDATE checkins SET sync_status=? WHERE local_id=?',
    [status, local_id],
  );
}

export async function checkinCounts() {
  const [r] = await database().executeSql(
    `SELECT
       COUNT(*) total,
       SUM(CASE WHEN sync_status='pending' THEN 1 ELSE 0 END) pending
     FROM checkins`,
  );
  return r.rows.item(0) || { total: 0, pending: 0 };
}

export async function hasCheckinForTarget(kind, target_id) {
  const [r] = await database().executeSql(
    'SELECT local_id FROM checkins WHERE kind=? AND target_id=? LIMIT 1',
    [kind, target_id],
  );
  return r.rows.length > 0;
}

export async function recentCheckins(limit = 300) {
  const [r] = await database().executeSql(
    'SELECT * FROM checkins ORDER BY scanned_at DESC LIMIT ?', [limit],
  );
  return Array.from({ length: r.rows.length }, (_, i) => r.rows.item(i));
}

// ──────────────────────────────────────────────────────────────────────
// SEARCH (unified — tickets + accreditation)
// ──────────────────────────────────────────────────────────────────────
export async function searchTickets(term) {
  const q = `%${term}%`;
  const [r] = await database().executeSql(
    `SELECT * FROM tickets
       WHERE ticket_number LIKE ?
          OR section LIKE ?
          OR row LIKE ?
          OR seat LIKE ?
     ORDER BY ticket_number LIMIT 100`,
    [q, q, q, q],
  );
  return Array.from({ length: r.rows.length }, (_, i) => r.rows.item(i));
}

export async function searchAccreditations(term) {
  const q = `%${term}%`;
  const [r] = await database().executeSql(
    `SELECT * FROM accreditations
       WHERE full_name LIKE ?
          OR qr_token LIKE ?
          OR organization LIKE ?
          OR category_label LIKE ?
     ORDER BY full_name LIMIT 100`,
    [q, q, q, q],
  );
  return Array.from({ length: r.rows.length }, (_, i) => r.rows.item(i));
}