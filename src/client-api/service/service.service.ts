import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientApiServiceService {
  constructor(private prisma: PrismaService) {}

  findAll(organizationId: string, employeeId?: string, include: string[] = []) {
    const includeEmployees = include.includes('employee');
    return this.prisma.service.findMany({
      where: this.prisma.notDeleted({
        organizationId,
        isActive: true,
        ...(employeeId && { employees: { some: { id: employeeId } } }),
      }),
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        photo: true,
        price: true,
        duration: true,
        durationMax: true,
        ...(includeEmployees && {
          employees: {
            where: this.prisma.notDeleted({ isPublic: true, isActive: true }),
            select: {
              id: true,
              user: { select: { email: true } },
              position: { select: { id: true, name: true } },
            },
          },
        }),
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    const service = await this.prisma.service.findFirst({
      where: this.prisma.notDeleted({ id, organizationId, isActive: true }),
      select: {
        id: true,
        title: true,
        description: true,
        photo: true,
        price: true,
        duration: true,
        durationMax: true,
      },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }
}
