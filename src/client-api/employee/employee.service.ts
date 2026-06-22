import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const EMPLOYEE_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  photo: true,
  description: true,
  phone: true,
  workSchedule: true,
  experienceYears: true,
  isActive: true,
  isPublic: true,
  user: { select: { email: true } },
  position: { select: { id: true, name: true } },
  specialties: { select: { id: true, name: true } },
};

const SERVICES_SELECT = {
  services: {
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
};

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
        ...EMPLOYEE_SELECT,
        ...(includeServices && {
          services: {
            where: this.prisma.notDeleted({ isActive: true }),
            select: SERVICES_SELECT.services.select,
          },
        }),
      },
    });
  }

  findOne(organizationId: string, id: string) {
    return this.prisma.employee.findFirst({
      where: this.prisma.notDeleted({
        id,
        organizationId,
        isPublic: true,
        isActive: true,
      }),
      select: {
        ...EMPLOYEE_SELECT,
        about: true,
        education: true,
        certificates: true,
        services: {
          where: this.prisma.notDeleted({ isActive: true }),
          select: SERVICES_SELECT.services.select,
        },
      },
    });
  }
}
