import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithContext } from '../auth-context.types';
import { hasPermission } from '../permission.utils';

/**
 * Returns true if user has the permission in globalPosition or in position (current org).
 * Use for conditional logic (e.g. includeInactive when user has service:read).
 */
export const HasPermission: (permission: string) => any = (permission: string) =>
  createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): boolean => {
      const req = ctx.switchToHttp().getRequest<RequestWithContext>();
      const user = req.authContext?.user ?? req.user;
      const organizationId = req.authContext?.organizationId ?? req.organizationId;
      return hasPermission(user, permission, organizationId);
    },
  );
