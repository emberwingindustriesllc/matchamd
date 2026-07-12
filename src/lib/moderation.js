export const MODERATION_ROLES = ['admin', 'moderator'];

export function normalizeModerationRole(role) {
  return typeof role === 'string' ? role.toLowerCase() : '';
}

export function canManageModeration(role) {
  return MODERATION_ROLES.includes(normalizeModerationRole(role));
}

export function canAssignModeratorRole(role) {
  return normalizeModerationRole(role) === 'admin';
}
