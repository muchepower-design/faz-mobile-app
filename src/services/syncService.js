// src/services/syncService.js
import { api, unwrap } from '../api/client';
import { setSetting, getSetting, clearAllData } from '../database/database';
import {
  saveTicket,
  saveAccreditation,
  pendingCheckins,
  updateCheckinStatus,
} from '../database/repository';
import { useAuthStore } from '../store/authStore';

let running = false;

/**
 * Called on app start, on scanner mount, and every 60s from useScannerSync.
 *
 * Steps:
 *   1. If we haven't downloaded the snapshot yet for this match, do it.
 *      (Paginated if >1000 tickets + accreditations.)
 *   2. Push any pending offline check-ins to /api/gate/checkin/batch.
 */
export async function syncDirectory() {
  if (running) return;
  running = true;

  try {
    const matchId = await getSetting('match_id');
    if (!matchId) {
      // Nothing to do until the user activates a device for a match.
      return;
    }

    // ─── 1. Snapshot download ───
    const snapshotDone = await getSetting('snapshot_complete');
    if (snapshotDone !== '1') {
      await downloadFullSnapshot(matchId);
    }

    // ─── 2. Push pending check-ins ───
    await flushCheckins();
  } catch (e) {
    // Network errors, auth errors etc — the device stays offline.
    // The next 60s tick will retry.
    console.warn('[sync] deferred:', e?.message || e);
  } finally {
    running = false;
  }
}

async function downloadFullSnapshot(matchId) {
  let afterTicket = (await getSetting('snapshot_after_ticket')) || '0';
  let afterAccreditation = (await getSetting('snapshot_after_accreditation')) || '0';

  // One-time wipe so we don't accumulate stale rows across matches.
  await clearAllData();
  await setSetting('match_id', matchId);

  let guard = 0;
  while (guard++ < 200) {
    const res = await api.get('/snapshot', {
      params: {
        after_ticket: afterTicket,
        after_accreditation: afterAccreditation,
        limit: 1000,
      },
    });
    const data = unwrap(res);

    for (const t of data.tickets || []) {
  await saveTicket(t);
  console.log('[sync] ticket', t.short_code, '→', t.ticket_number);
  afterTicket = t.id;
}
    for (const a of data.accreditations || []) {
      await saveAccreditation(a);
      afterAccreditation = a.id;
    }

    await setSetting('snapshot_after_ticket', afterTicket);
    await setSetting('snapshot_after_accreditation', afterAccreditation);

    const stillMore =
      (data.tickets_has_more && (data.tickets || []).length > 0) ||
      (data.accreditations_has_more && (data.accreditations || []).length > 0);

        if (!stillMore) {
      // Persist match context for the scanner result header.
      const match = useAuthStore.getState().event;
      if (match) {
        await setSetting('match_info', JSON.stringify({
          home_team: match.event_name?.split(' vs ')[0] || '',
          away_team: match.event_name?.split(' vs ')[1] || '',
          venue: match.venue || '',
          competition: match.event_code || '',
        }));
      }
      await setSetting('snapshot_complete', '1');
      return;
    }
  }

  // Safety net — cap the pagination so a bug can't loop forever.
  await setSetting('snapshot_complete', '1');
}

async function flushCheckins() {
  const rows = await pendingCheckins(500);
  if (!rows.length) return;

  // Send in chunks of 100 to stay under the server's 1000-item cap.
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const body = {
      records: batch.map((x) => ({
        local_id: x.local_id,
        kind: x.kind,
        target_id: x.target_id,
        method: x.method,
        scanned_at: x.scanned_at,
      })),
    };
    const res = await api.post('/checkin/batch', body);
    const data = unwrap(res);
    for (const result of data.results || []) {
      if (result.status === 'accepted') {
        await updateCheckinStatus(result.local_id, 'synced');
      } else if (result.status === 'duplicate') {
        await updateCheckinStatus(result.local_id, 'duplicate');
      } else {
        await updateCheckinStatus(result.local_id, 'rejected');
      }
    }
  }
}

/**
 * Force a full re-sync — used by the Settings screen's "Synchronise now".
 */
export async function forceFullSync() {
  await setSetting('snapshot_complete', '');
  await setSetting('snapshot_after_ticket', '0');
  await setSetting('snapshot_after_accreditation', '0');
  await syncDirectory();
}