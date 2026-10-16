import { supabase } from '@/api/supabaseClient';

const BLOCKED_USERS_KEY = 'matchamd_blocked_users_v1';
const FLAGGED_ITEMS_KEY = 'matchamd_flagged_ugc_items_v1';
const UGC_REPORTS_LOG_KEY = 'matchamd_ugc_reports_log_v1';

export const REPORT_REASONS = [
  { id: 'scam_fraud', label: 'Predatory Scam / Fake Rotation Agency' },
  { id: 'spam_promo', label: 'Paid Promotion / Unverified Consultant Spam' },
  { id: 'harassment', label: 'Harassment, Hate Speech, or Bullying' },
  { id: 'misinformation', label: 'False Visa / Program / Match Information' },
  { id: 'doxxing_phi', label: 'HIPAA / Patient Privacy or Personal Info' },
  { id: 'other', label: 'Other Policy Violation' },
];

export function getBlockedUsers() {
  try {
    const raw = localStorage.getItem(BLOCKED_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isUserBlocked(authorIdentifier) {
  if (!authorIdentifier) return false;
  const blocked = getBlockedUsers();
  const normalized = String(authorIdentifier).trim().toLowerCase();
  return blocked.some(
    (entry) =>
      String(entry.id || '').trim().toLowerCase() === normalized ||
      String(entry.name || '').trim().toLowerCase() === normalized
  );
}

export function blockUser({ id, name, reason = 'Blocked by user' }) {
  try {
    const current = getBlockedUsers();
    const targetId = String(id || name || 'anonymous').trim();
    const targetName = String(name || id || 'Anonymous User').trim();
    if (!current.some((u) => u.id === targetId || u.name === targetName)) {
      const updated = [
        ...current,
        {
          id: targetId,
          name: targetName,
          reason,
          blockedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('matchamd-ugc-updated'));
      return updated;
    }
    return current;
  } catch {
    return [];
  }
}

export function unblockUser(identifier) {
  try {
    const current = getBlockedUsers();
    const updated = current.filter(
      (u) => u.id !== identifier && u.name !== identifier
    );
    localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('matchamd-ugc-updated'));
    return updated;
  } catch {
    return [];
  }
}

export function getFlaggedItemIds() {
  try {
    const raw = localStorage.getItem(FLAGGED_ITEMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isItemFlagged(itemId) {
  if (!itemId) return false;
  return getFlaggedItemIds().includes(String(itemId));
}

export async function reportUGCContent({
  itemId,
  itemType = 'post',
  title = '',
  authorName = 'Anonymous',
  reason = 'scam_fraud',
  details = '',
  hideItem = true,
}) {
  const reportEntry = {
    id: `report_${Date.now()}`,
    item_id: String(itemId || `item_${Date.now()}`),
    item_type: itemType,
    title,
    author_name: authorName,
    reason,
    details,
    created_at: new Date().toISOString(),
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem(UGC_REPORTS_LOG_KEY) || '[]');
    localStorage.setItem(
      UGC_REPORTS_LOG_KEY,
      JSON.stringify([reportEntry, ...existingLogs.slice(0, 99)])
    );

    if (hideItem && itemId) {
      const flagged = getFlaggedItemIds();
      if (!flagged.includes(String(itemId))) {
        localStorage.setItem(
          FLAGGED_ITEMS_KEY,
          JSON.stringify([...flagged, String(itemId)])
        );
      }
    }
  } catch {
    // ignore storage errors
  }

  // Best-effort remote logging to Supabase if table exists
  try {
    await supabase.from('ugc_reports').insert([reportEntry]);
  } catch {
    // Table may not exist in all environments; local report & hide still succeeds
  }

  window.dispatchEvent(new CustomEvent('matchamd-ugc-updated'));
  return reportEntry;
}

export function clearAllUGCBlocksAndFlags() {
  try {
    localStorage.removeItem(BLOCKED_USERS_KEY);
    localStorage.removeItem(FLAGGED_ITEMS_KEY);
    localStorage.removeItem(UGC_REPORTS_LOG_KEY);
    window.dispatchEvent(new CustomEvent('matchamd-ugc-updated'));
  } catch {
    // ignore
  }
}
