import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithContext } from '../middleware/auth-context.middleware';

export const OrgId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<RequestWithContext>();
    return req.organizationId;
  },
);
