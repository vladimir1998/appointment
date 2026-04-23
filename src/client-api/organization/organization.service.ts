import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientApiOrganizationService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.organization.findMany({
      where: this.prisma.notDeleted({ active: true }),
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true, logo: true },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findFirst({
      where: this.prisma.notDeleted({ id, active: true }),
      select: { id: true, name: true, description: true, logo: true },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }
}
