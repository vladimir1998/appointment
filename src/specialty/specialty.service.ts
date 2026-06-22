import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpecialtyInput } from './dto/create-specialty.dto';
import { UpdateSpecialtyInput } from './dto/update-specialty.dto';

@Injectable()
export class SpecialtyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSpecialtyInput) {
    return this.prisma.specialty.create({
      data: dto,
    });
  }

  async findAllSystemWide() {
    return this.prisma.specialty.findMany({
      where: this.prisma.notDeleted(),
      orderBy: { name: 'asc' },
    });
  }

  async findAllByOrganization(organizationId: string) {
    return this.prisma.specialty.findMany({
      where: this.prisma.notDeleted({ organizationId }),
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, organizationId?: string) {
    const specialty = await this.prisma.specialty.findFirst({
      where: this.prisma.notDeleted({ id, ...(organizationId ? { organizationId } : {}) }),
    });
    if (!specialty) {
      throw new NotFoundException('Specialty not found');
    }
    return specialty;
  }

  async update(id: string, dto: UpdateSpecialtyInput, organizationId?: string) {
    await this.findOne(id, organizationId);
    return this.prisma.specialty.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, organizationId?: string) {
    await this.findOne(id, organizationId);
    return this.prisma.softDelete(this.prisma.specialty, { id });
  }
}
