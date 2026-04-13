import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestWithContext } from '../auth-context.types';

export type { RequestWithContext, RequestUser, AuthContext, UserPosition } from '../auth-context.types';

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async use(req: RequestWithContext, res: Response, next: NextFunction) {
    const orgIdHeader = req.headers['x-organization-id'];
    const orgId =
      typeof orgIdHeader === 'string' && orgIdHeader ? orgIdHeader : undefined;
    if (orgId) {
      req.organizationId = orgId;
    }

    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = this.jwt.verify<{ sub: string; email: string }>(token);
        req.user = { id: payload.sub, email: payload.email };

        const [userWithGlobalPosition, employee] = await Promise.all([
          this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
              globalPosition: {
                include: {
                  permissions: { where: this.prisma.notDeleted() },
                },
              },
            },
          }),
          orgId
            ? this.prisma.employee.findFirst({
                where: this.prisma.notDeleted({
                  userId: payload.sub,
                  organizationId: orgId,
                }),
                include: {
                  position: {
                    include: {
                      permissions: { where: this.prisma.notDeleted() },
                    },
                  },
                },
              })
            : null,
        ]);

        const pos = userWithGlobalPosition?.globalPosition;
        if (pos && !pos.deletedAt) {
          req.user.globalPosition = {
            id: pos.id,
            name: pos.name,
            permissions: pos.permissions.map((p: { id: string; name: string; value: string }) => ({
              id: p.id,
              name: p.name,
              value: p.value,
            })),
          };
        }

        type EmployeeWithPosition = {
          position?: {
            id: string;
            name: string;
            deletedAt: Date | null;
            permissions: { id: string; name: string; value: string }[];
          };
        } | null;
        const emp = employee as EmployeeWithPosition;
        if (emp?.position && !emp.position.deletedAt) {
          req.user.position = {
            id: emp.position.id,
            name: emp.position.name,
            permissions: emp.position.permissions.map((p) => ({
              id: p.id,
              name: p.name,
              value: p.value,
            })),
          };
        }
        // Всегда сохраняем обогащённого пользователя (globalPosition / position).
        // JwtAuthGuard позже подменит req.user на { id, email } из JWT — без этого
        // PermissionGuard потерял бы права при вызовах без x-organization-id.
        if (req.user) {
          req.authContext = {
            user: req.user,
            ...(req.organizationId ? { organizationId: req.organizationId } : {}),
          };
        }
      } catch {
        // Invalid or expired token — skip, protected routes will reject via JwtAuthGuard
      }
    }

    next();
  }
}
