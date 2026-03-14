import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSION_KEY = 'requirePermission';

export const RequirePermission = (permission: string) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permission);

export const REQUIRE_PERMISSION_OR_KEY = 'requirePermissionOr';

export interface PermissionOrOptions {
  /** Permission required when x-organization-id header is absent (global only) */
  withoutOrg: string;
  /** Permission required when x-organization-id header is present (global or org employee) */
  withOrg: string;
}

export const RequirePermissionOr = (options: PermissionOrOptions) =>
  SetMetadata(REQUIRE_PERMISSION_OR_KEY, options);
