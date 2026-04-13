import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithContext } from '../middleware/auth-context.middleware';

export const HasOrgContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): boolean => {
    const req = ctx.switchToHttp().getRequest<RequestWithContext>();
    return !!req.authContext?.organizationId;
  },
);
