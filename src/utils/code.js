// src/utils/code.js
/**
 * Extract likely FAZ ticket numbers or accreditation QR tokens from any
 * free-form text (SMS, OCR result, or user paste).
 *
 * Recognised patterns:
 *   FAZ-TICKET:<uuid>[:<match>:<ticket_type>]     <- from ticket QR payload
 *   <uuid>                                         <- raw ticket / accreditation
 *   <16 hex chars>                                 <- accreditation qr_token
 *   REG-... / REF-... / TXN-...                    <- generic ticket numbers
 */

export const normalizeCode = (value) =>
  String(value || '').trim().replace(/\s+/g, '').toUpperCase();

const UUID_RE =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;
const FAZ_TICKET_RE =
  /FAZ[-_]TICKET[:\s]*([0-9a-f-]{36})/i;
const ACCREDITATION_HEX_RE = /\b[0-9a-f]{16}\b/i;

export function extractCodes(text) {
  const raw = String(text || '');
  const found = new Set();

  // 1. FAZ-TICKET:<uuid>  (preferred, appears in SMS)
  let m;
  const g = new RegExp(FAZ_TICKET_RE.source, 'ig');
  while ((m = g.exec(raw)) !== null) {
    found.add(m[1].toLowerCase());
  }

  // 2. Raw UUIDs anywhere
  const u = new RegExp(UUID_RE.source, 'g');
  while ((m = u.exec(raw)) !== null) {
    found.add(m[0].toLowerCase());
  }

  // 3. Accreditation 16-char hex tokens
  const h = new RegExp(ACCREDITATION_HEX_RE.source, 'g');
  while ((m = h.exec(raw)) !== null) {
    found.add(m[0].toLowerCase());
  }

  // 4. Generic ticket numbers like REG-2026-008451
  const generic = raw.match(/\b[A-Z]{2,5}-\d{4,}-[A-Z0-9]{4,}\b/gi) || [];
  generic.forEach((x) => found.add(normalizeCode(x)));

  return [...found];
}

export function looksLikeUuid(value) {
  return UUID_RE.test(String(value || ''));
}

export function looksLikeAccreditationToken(value) {
  return ACCREDITATION_HEX_RE.test(String(value || ''));
}