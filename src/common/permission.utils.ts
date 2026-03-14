import type { RequestUser } from './auth-context.types';

/**
 * Checks if user has the permission in globalPosition or in position (current org).
 * When globalPosition has the permission, org membership is not required.
 */
export function hasPermission(
  user: RequestUser | undefined,
  permission: string,
  organizationId?: string,
): boolean {
  const hasGlobal =
    user?.globalPosition?.permissions.some((p) => p.value === permission) ??
    false;

  if (hasGlobal) return true;

  const hasPosition =
    organizationId &&
    user?.position &&
    user.position.permissions.some((p) => p.value === permission);

  return !!hasPosition;
}

/**
 * Returns true if user has permission via globalPosition (no org check needed).
 */
export function hasGlobalPermission(
  user: RequestUser | undefined,
  permission: string,
): boolean {
  return !!user?.globalPosition?.permissions.some((p) => p.value === permission);
}
