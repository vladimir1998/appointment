import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RequestWithContext } from '../auth-context.types';
import { hasGlobalPermission, hasPermission } from '../permission.utils';
import {
  REQUIRE_PERMISSION_KEY,
  REQUIRE_PERMISSION_OR_KEY,
} from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissionOr = this.reflector.get<{ withoutOrg: string; withOrg: string }>(
      REQUIRE_PERMISSION_OR_KEY,
      context.getHandler(),
    );
    const permissionSingle = this.reflector.get<string>(
      REQUIRE_PERMISSION_KEY,
      context.getHandler(),
    );

    const req = context.switchToHttp().getRequest<RequestWithContext>();
    const organizationId = req.authContext?.organizationId ?? req.organizationId;

    const permission = permissionOr
      ? organizationId
        ? permissionOr.withOrg
        : permissionOr.withoutOrg
      : permissionSingle;

    if (!permission) return true;

    const user = req.authContext?.user ?? req.user;

    if (hasGlobalPermission(user, permission)) {
      return true;
    }

    if (!organizationId) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }

    if (!user?.position) {
      throw new ForbiddenException(
        'You must be an employee of this organization',
      );
    }

    if (!hasPermission(user, permission, organizationId)) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }

    return true;
  }
}
