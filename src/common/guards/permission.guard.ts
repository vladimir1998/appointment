import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithContext } from '../middleware/auth-context.middleware';
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
    const ctx = req.authContext;

    if (!ctx?.organizationId) {
      throw new ForbiddenException('x-organization-id header is required');
    }

    if (!ctx.user?.position) {
      throw new ForbiddenException(
        'You must be an employee of this organization',
      );
    }

    const hasPermission = ctx.user.position.permissions.some(
      (p) => p.value === permission,
    );
    if (!hasPermission) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }

    return true;
  }
}
