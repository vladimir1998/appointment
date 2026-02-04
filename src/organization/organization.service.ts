import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationInput } from './dto/create-organization.dto';
import { UpdateOrganizationInput } from './dto/update-organization.dto';

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

  async findOne(id: string) {
    const organization = await this.prisma.organization.findFirst({
      where: this.prisma.notDeleted({ id }),
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
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
