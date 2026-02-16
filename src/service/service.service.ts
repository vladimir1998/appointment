import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceInput } from './dto/create-service.dto';
import { UpdateServiceInput } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateServiceInput) {
    return this.prisma.service.create({
      data: dto,
      include: { organization: { select: { id: true, name: true } } },
    });
  }

  async findAllByOrganization(organizationId: string) {
    return this.prisma.service.findMany({
      where: this.prisma.notDeleted({ organizationId }),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findFirst({
      where: this.prisma.notDeleted({ id }),
      include: { organization: { select: { id: true, name: true } } },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async update(id: string, dto: UpdateServiceInput) {
    await this.findOne(id);
    return this.prisma.service.update({
      where: { id },
      data: dto,
      include: { organization: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.softDelete(this.prisma.service, { id });
  }
}
