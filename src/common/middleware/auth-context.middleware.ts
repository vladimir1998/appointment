import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

export interface RequestWithContext extends Request {
  user?: { id: string; email: string };
  organizationId?: string;
}

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  constructor(private jwt: JwtService) {}

  use(req: RequestWithContext, res: Response, next: NextFunction) {
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
      } catch {
        // Invalid or expired token — skip, protected routes will reject via JwtAuthGuard
      }
    }

    next();
  }
}
