import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestWithContext } from '../../common/auth-context.types';
import { hasGlobalPermission } from '../../common/permission.utils';

const PERM = 'organization:read';

/**
 * GET /organizations*: глобальный organization:read — ок;
 * иначе доступ, если у пользователя есть сотрудник в какой‑либо org с этим правом в должности.
 */
@Injectable()
export class OrganizationReadScopeGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithContext>();
    const user = req.authContext?.user ?? req.user;
    if (!user?.id) {
      throw new UnauthorizedException();
    }

    if (hasGlobalPermission(user, PERM)) {
      return true;
    }

    const employees = await this.prisma.employee.findMany({
      where: this.prisma.notDeleted({ userId: user.id, isActive: true }),
      include: {
        position: {
          include: {
            permissions: { where: this.prisma.notDeleted() },
          },
        },
      },
    });

    const ok = employees.some(
      (e) =>
        e.position &&
        !e.position.deletedAt &&
        e.position.permissions.some((p) => p.value === PERM),
    );

    if (!ok) {
      throw new ForbiddenException(`Missing permission: ${PERM}`);
    }
    return true;
  }
}
