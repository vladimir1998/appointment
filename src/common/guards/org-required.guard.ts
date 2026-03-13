import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequestWithContext } from '../middleware/auth-context.middleware';

@Injectable()
export class OrgRequiredGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithContext>();
    if (!req.organizationId) {
      throw new ForbiddenException('x-organization-id header is required');
    }
    return true;
  }
}
