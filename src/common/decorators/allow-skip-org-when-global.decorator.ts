import { SetMetadata } from '@nestjs/common';

export const ALLOW_SKIP_ORG_WHEN_GLOBAL_KEY = 'allowSkipOrgWhenGlobal';

/**
 * When user has global permission for this route, OrgRequiredGuard will skip org header check.
 * Use for routes where org can be provided in body/query (e.g. create with organizationId in DTO).
 */
export const AllowSkipOrgWhenGlobal = () =>
  SetMetadata(ALLOW_SKIP_ORG_WHEN_GLOBAL_KEY, true);
