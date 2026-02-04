import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Soft delete helpers
  async softDelete<T extends { deletedAt?: Date | null }>(
    model: { update: (args: { where: any; data: any }) => Promise<T> },
    where: any,
  ): Promise<T> {
    return model.update({
      where,
      data: { deletedAt: new Date() } as any,
    });
  }

  async restore<T extends { deletedAt?: Date | null }>(
    model: { update: (args: { where: any; data: any }) => Promise<T> },
    where: any,
  ): Promise<T> {
    return model.update({
      where,
      data: { deletedAt: null } as any,
    });
  }

  // Filter helper - adds deletedAt: null to where clause
  notDeleted<T extends Record<string, any>>(where?: T): T & { deletedAt: null } {
    return { ...where, deletedAt: null } as T & { deletedAt: null };
  }
}
