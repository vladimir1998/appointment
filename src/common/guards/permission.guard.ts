import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RequestWithContext } from '../auth-context.types';
import { hasGlobalPermission, hasPermission } from '../permission.utils';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<string>(
      REQUIRE_PERMISSION_KEY,
      context.getHandler(),
    );
    if (!permission) return true;

    const req = context.switchToHttp().getRequest<RequestWithContext>();
    const user = req.authContext?.user ?? req.user;
    const organizationId = req.authContext?.organizationId ?? req.organizationId;

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
