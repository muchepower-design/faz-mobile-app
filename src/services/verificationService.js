// src/services/verificationService.js
import {
  findTicketByNumber,
  findTicketById,
  findAccreditationByToken,
  findAccreditationById,
  markTicketUsedLocally,
  markAccreditationCheckedInLocally,
  saveCheckin,
  hasCheckinForTarget,
} from '../database/repository';
import { normalizeCode } from '../utils/code';
import { getSetting } from '../database/database';

/**
 * Verify a scanned value and record the check-in.
 *
 * Returns:
 *   {
 *     ok, kind, holder, match, reason, elapsedMs
 *   }
 */
export async function verifyCredential(raw, method = 'qr') {
  const started = Date.now();
  const code = normalizeCode(raw);

  if (!code) {
    return finish({ ok: false, kind: null, holder: null, reason: 'Nothing scanned or pasted.' }, started);
  }

  const match = await readMatchContext();
  const matchInfo = match
    ? {
        home: match.home_team || 'Home',
        away: match.away_team || 'Away',
        venue: match.venue || null,
        competition: match.competition || null,
      }
    : null;

  // ─── Try ticket ───
  let ticket = await findTicketByNumber(code);
  if (!ticket) ticket = await findTicketById(code);

  if (ticket) {
    if (ticket.is_used) {
      return finish({
        ok: false, kind: 'ticket', holder: ticket, match: matchInfo,
        reason: `Ticket already scanned at ${formatTime(ticket.used_at)}.`,
      }, started);
    }
    if (await hasCheckinForTarget('ticket', ticket.id)) {
      return finish({
        ok: false, kind: 'ticket', holder: ticket, match: matchInfo,
        reason: 'Already checked in on this device.',
      }, started);
    }

    await markTicketUsedLocally(ticket.id);
    await saveCheckin({
      local_id: generateLocalId(),
      kind: 'ticket',
      target_id: ticket.id,
      holder_name: null,
      method,
      scanned_at: new Date().toISOString(),
      sync_status: 'pending',
    });

    return finish({
      ok: true, kind: 'ticket', holder: ticket, match: matchInfo,
      reason: `Valid ticket — ${ticket.section || '?'} · Row ${ticket.row || '?'} · Seat ${ticket.seat || '?'}`,
    }, started);
  }

  // ─── Try accreditation ───
  let acc = await findAccreditationByToken(code);
  if (!acc) acc = await findAccreditationById(code);

  if (acc) {
    if (acc.is_checked_in) {
      return finish({
        ok: false, kind: 'accreditation', holder: acc, match: matchInfo,
        reason: `Card already checked in at ${formatTime(acc.checked_in_at)}.`,
      }, started);
    }
    if (await hasCheckinForTarget('accreditation', acc.id)) {
      return finish({
        ok: false, kind: 'accreditation', holder: acc, match: matchInfo,
        reason: 'Already checked in on this device.',
      }, started);
    }

    await markAccreditationCheckedInLocally(acc.id);
    await saveCheckin({
      local_id: generateLocalId(),
      kind: 'accreditation',
      target_id: acc.id,
      holder_name: acc.full_name,
      method,
      scanned_at: new Date().toISOString(),
      sync_status: 'pending',
    });

    return finish({
      ok: true, kind: 'accreditation', holder: acc, match: matchInfo,
      reason: `Valid accreditation — ${acc.category_label || acc.category}`,
    }, started);
  }

  return finish({
    ok: false, kind: null, holder: null, match: matchInfo,
    reason: 'No matching ticket or accreditation on this device. ' +
            'Sync the device or check the number.',
  }, started);
}

function finish(result, started) {
  return { ...result, elapsedMs: Date.now() - started };
}

async function readMatchContext() {
  try {
    const raw = await getSetting('match_info');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatTime(iso) {
  if (!iso) return 'an earlier time';
  try {
    return new Date(iso).toLocaleTimeString();
  } catch {
    return iso;
  }
}

function generateLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}