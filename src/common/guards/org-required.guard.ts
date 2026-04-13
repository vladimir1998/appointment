import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RequestWithContext } from '../auth-context.types';
import { hasGlobalPermission } from '../permission.utils';
import {
  REQUIRE_PERMISSION_KEY,
  REQUIRE_PERMISSION_OR_KEY,
} from '../decorators/require-permission.decorator';
import { ALLOW_SKIP_ORG_WHEN_GLOBAL_KEY } from '../decorators/allow-skip-org-when-global.decorator';

@Injectable()
export class OrgRequiredGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithContext>();
    const user = req.authContext?.user ?? req.user;
    const organizationId = req.authContext?.organizationId ?? req.organizationId;

    const allowSkipOrg = this.reflector.get<boolean>(
      ALLOW_SKIP_ORG_WHEN_GLOBAL_KEY,
      context.getHandler(),
    );

    const permissionOr = this.reflector.get<{ withoutOrg: string; withOrg: string }>(
      REQUIRE_PERMISSION_OR_KEY,
      context.getHandler(),
    );
    const permissionSingle = this.reflector.get<string>(
      REQUIRE_PERMISSION_KEY,
      context.getHandler(),
    );

    const permission = permissionOr
      ? organizationId
        ? permissionOr.withOrg
        : permissionOr.withoutOrg
      : permissionSingle;

    if (
      allowSkipOrg &&
      permission &&
      hasGlobalPermission(user, permission)
    ) {
      return true;
    }

    if (!req.organizationId) {
      throw new ForbiddenException('x-organization-id header is required');
    }
    return true;
  }
}
