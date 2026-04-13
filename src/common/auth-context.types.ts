import type { Request } from 'express';

export interface UserPosition {
  id: string;
  name: string;
  permissions: { id: string; name: string; value: string }[];
}

export interface RequestUser {
  id: string;
  email: string;
  position?: UserPosition;
  globalPosition?: UserPosition;
}

export interface AuthContext {
  user: RequestUser;
  /** Задан, если в запросе был заголовок x-organization-id */
  organizationId?: string;
}

export interface RequestWithContext extends Request {
  user?: RequestUser;
  organizationId?: string;
  authContext?: AuthContext;
}
