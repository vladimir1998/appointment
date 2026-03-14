import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export interface UserPosition {
  id: string;
  name: string;
  permissions: { id: string; name: string; value: string }[];
}

export interface RequestUser {
  id: string;
  email: string;
  position?: UserPosition;
}

export interface AuthContext {
  user: RequestUser;
  organizationId: string;
}

export interface RequestWithContext extends Request {
  user?: RequestUser;
  organizationId?: string;
  authContext?: AuthContext;
}

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async use(req: RequestWithContext, res: Response, next: NextFunction) {
    const orgId = req.headers['x-organization-id'];
    if (typeof orgId === 'string' && orgId) {
      req.organizationId = orgId;
    }

    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = this.jwt.verify<{ sub: string; email: string }>(token);
        req.user = { id: payload.sub, email: payload.email };

        if (orgId) {
          const employee = await this.prisma.employee.findFirst({
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
          });

          if (employee?.position && !employee.position.deletedAt) {
            req.user.position = {
              id: employee.position.id,
              name: employee.position.name,
              permissions: employee.position.permissions.map((p: { id: string; name: string; value: string }) => ({
                id: p.id,
                name: p.name,
                value: p.value,
              })),
            };
          }
        }
        if (req.organizationId) {
          req.authContext = {
            user: req.user,
            organizationId: req.organizationId,
          };
        }
      } catch {
        // Invalid or expired token — skip, protected routes will reject via JwtAuthGuard
      }
    }

    next();
  }
}
