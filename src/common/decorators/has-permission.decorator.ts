import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithContext } from '../middleware/auth-context.middleware';

/**
 * Returns true if user is employee of current organization and has the given permission.
 * Use for conditional logic (e.g. includeInactive when user has service:read).
 */
export const HasPermission: (permission: string) => any = (permission: string) =>
  createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): boolean => {
      const req = ctx.switchToHttp().getRequest<RequestWithContext>();
      const authCtx = req.authContext;
      return !!(
        authCtx?.organizationId &&
        authCtx?.user?.position &&
        authCtx.user.position.permissions.some((p) => p.value === permission)
      );
    },
  );
