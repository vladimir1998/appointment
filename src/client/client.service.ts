import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientInput } from './dto/create-client.dto';
import { UpdateClientInput } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClientInput) {
    const { organizationId, ...clientData } = dto;

    return this.prisma.client.create({
      data: {
        ...clientData,
        organizations: {
          create: { organizationId },
        },
      },
      include: {
        organizations: {
          include: { organization: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async findAllByOrganization(organizationId: string) {
    return this.prisma.client.findMany({
      where: {
        deletedAt: null,
        organizations: { some: { organizationId } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findFirst({
      where: this.prisma.notDeleted({ id }),
      include: {
        organizations: {
          include: { organization: { select: { id: true, name: true } } },
        },
        appointments: {
          where: { deletedAt: null },
          orderBy: { startTime: 'desc' },
          take: 10,
        },
      },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async update(id: string, dto: UpdateClientInput) {
    await this.findOne(id);
    return this.prisma.client.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.softDelete(this.prisma.client, { id });
  }
}
