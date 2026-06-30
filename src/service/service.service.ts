import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceInput } from './dto/create-service.dto';
import { UpdateServiceInput } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateServiceInput) {
    const data = {
      title: dto.title,
      description: dto.description,
      price: dto.price,
      duration: dto.duration,
      organizationId: dto.organizationId,
      ...(dto.photo != null && { photo: dto.photo }),
      ...(dto.priceMax != null && { priceMax: dto.priceMax }),
      ...(dto.priceType != null && { priceType: dto.priceType }),
      ...(dto.priceComment != null && { priceComment: dto.priceComment }),
      ...(dto.durationMax != null && { durationMax: dto.durationMax }),
      ...(dto.about != null && { about: dto.about }),
    };
    return this.prisma.service.create({
      data: data as Parameters<PrismaService['service']['create']>[0]['data'],
      include: { organization: { select: { id: true, name: true } } },
    });
  }

  async findAllByOrganization(organizationId: string) {
    const where = this.prisma.notDeleted({ organizationId });
    return this.prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employees: { select: { id: true, firstName: true, lastName: true, user: { select: { id: true, email: true } } } },
      },
    });
  }

  async findOne(
    id: string,
    options?: { organizationId?: string },
  ) {
    const where: Record<string, unknown> = this.prisma.notDeleted({ id });
    if (options?.organizationId) {
      where.organizationId = options.organizationId;
    }
    const service = await this.prisma.service.findFirst({
      where,
      include: {
        organization: { select: { id: true, name: true } },
        employees: { select: { id: true, firstName: true, lastName: true, user: { select: { id: true, email: true } } } },
      },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async update(id: string, dto: UpdateServiceInput, organizationId?: string) {
    const service = await this.findOne(id, {});
    if (organizationId && service.organizationId !== organizationId) {
      throw new NotFoundException('Service not found');
    }
    const { employeeIds, ...rest } = dto;
    return this.prisma.service.update({
      where: { id },
      data: {
        ...rest,
        ...(employeeIds !== undefined && { employees: { set: employeeIds.map((eid) => ({ id: eid })) } }),
      },
      include: {
        organization: { select: { id: true, name: true } },
        employees: { select: { id: true, firstName: true, lastName: true, user: { select: { id: true, email: true } } } },
      },
    });
  }

  async remove(id: string, organizationId?: string) {
    const service = await this.findOne(id, {});
    if (organizationId && service.organizationId !== organizationId) {
      throw new NotFoundException('Service not found');
    }
    return this.prisma.softDelete(this.prisma.service, { id });
  }
}
