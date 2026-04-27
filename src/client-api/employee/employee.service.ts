import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientApiEmployeeService {
  constructor(private prisma: PrismaService) {}

  findAll(organizationId: string, serviceId?: string, include: string[] = []) {
    const includeServices = include.includes('service');
    return this.prisma.employee.findMany({
      where: this.prisma.notDeleted({
        organizationId,
        isPublic: true,
        isActive: true,
        ...(serviceId && { services: { some: { id: serviceId } } }),
      }),
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        user: { select: { email: true } },
        position: { select: { id: true, name: true } },
        ...(includeServices && {
          services: {
            where: this.prisma.notDeleted({ isActive: true }),
            select: {
              id: true,
              title: true,
              description: true,
              photo: true,
              price: true,
              duration: true,
              durationMax: true,
            },
          },
        }),
      },
    });
  }
}
