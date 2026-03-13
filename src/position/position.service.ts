import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionInput } from './dto/create-position.dto';
import { UpdatePositionInput } from './dto/update-position.dto';

@Injectable()
export class PositionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePositionInput) {
    const { permissions, ...rest } = dto;
    return this.prisma.position.create({
      data: {
        ...rest,
        permissions: permissions?.length
          ? { connect: permissions.map((id) => ({ id })) }
          : undefined,
      },
      include: { permissions: true },
    });
  }

  async findAllByOrganization(organizationId: string) {
    return this.prisma.position.findMany({
      where: this.prisma.notDeleted({ organizationId }),
      orderBy: { name: 'asc' },
      include: { permissions: true },
    });
  }

  async findOne(id: string) {
    const position = await this.prisma.position.findFirst({
      where: this.prisma.notDeleted({ id }),
    });
    if (!position) {
      throw new NotFoundException('Position not found');
    }
    return position;
  }

  async update(id: string, dto: UpdatePositionInput) {
    await this.findOne(id);
    const { permissions, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (permissions !== undefined) {
      data.permissions = {
        set: permissions.map((permissionId) => ({ id: permissionId })),
      };
    }
    return this.prisma.position.update({
      where: { id },
      data,
      include: { permissions: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.softDelete(this.prisma.position, { id });
  }
}
