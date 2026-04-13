import { Injectable, NotFoundException } from '@nestjs/common';
import type { RequestUser } from '../common/auth-context.types';
import { hasGlobalPermission } from '../common/permission.utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationInput } from './dto/create-organization.dto';
import { UpdateOrganizationInput } from './dto/update-organization.dto';

const ORG_READ = 'organization:read';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrganizationInput) {
    return this.prisma.organization.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.organization.findMany({
      where: this.prisma.notDeleted(),
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Список: все org — только при глобальном organization:read; иначе только org, где у пользователя это право в должности. */
  async findAllForCaller(user: RequestUser) {
    if (hasGlobalPermission(user, ORG_READ)) {
      return this.findAll();
    }
    const ids = await this.organizationIdsReadableByUser(user.id);
    if (ids.length === 0) {
      return [];
    }
    return this.prisma.organization.findMany({
      where: this.prisma.notDeleted({ id: { in: ids } }),
      orderBy: { createdAt: 'desc' },
    });
  }

  private async organizationIdsReadableByUser(userId: string): Promise<string[]> {
    const employees = await this.prisma.employee.findMany({
      where: this.prisma.notDeleted({ userId, isActive: true }),
      include: {
        position: {
          include: {
            permissions: { where: this.prisma.notDeleted() },
          },
        },
      },
    });
    return employees
      .filter(
        (e) =>
          e.position &&
          !e.position.deletedAt &&
          e.position.permissions.some((p) => p.value === ORG_READ),
      )
      .map((e) => e.organizationId);
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findFirst({
      where: this.prisma.notDeleted({ id }),
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  /** Одна org: глобальный read — любая; иначе только из разрешённых для пользователя org. */
  async findOneForCaller(user: RequestUser, id: string) {
    if (hasGlobalPermission(user, ORG_READ)) {
      return this.findOne(id);
    }
    const allowed = await this.organizationIdsReadableByUser(user.id);
    if (!allowed.includes(id)) {
      throw new NotFoundException('Organization not found');
    }
    return this.findOne(id);
  }

  async update(id: string, dto: UpdateOrganizationInput) {
    await this.findOne(id);
    return this.prisma.organization.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.softDelete(this.prisma.organization, { id });
  }
}
