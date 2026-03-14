import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeInput } from './dto/create-employee.dto';
import { UpdateEmployeeInput } from './dto/update-employee.dto';
import { RegisterEmployeeInput } from './dto/register-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterEmployeeInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: dto.email, password: hash },
      });

      return tx.employee.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          positionId: dto.positionId,
          userId: user.id,
          organizationId: dto.organizationId,
        },
        include: { user: { select: { id: true, email: true } }, organization: true, position: true },
      });
    });
  }

  async create(dto: CreateEmployeeInput) {
    const existing = await this.prisma.employee.findFirst({
      where: this.prisma.notDeleted({
        userId: dto.userId,
        organizationId: dto.organizationId,
      }),
    });
    if (existing) {
      throw new ConflictException(
        'User is already an employee in this organization',
      );
    }

    return this.prisma.employee.create({
      data: dto,
      include: { user: { select: { id: true, email: true } }, organization: true, position: true },
    });
  }

  async findAllByOrganization(
    organizationId: string,
    options?: { includeAll?: boolean },
  ) {
    const where: Record<string, unknown> = this.prisma.notDeleted({
      organizationId,
    });
    if (!options?.includeAll) {
      where.isPublic = true;
      where.isActive = true;
    }
    return this.prisma.employee.findMany({
      where,
      include: { user: { select: { id: true, email: true } }, position: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(
    id: string,
    organizationId: string,
    options?: { includeAll?: boolean },
  ) {
    const where: Record<string, unknown> = this.prisma.notDeleted({
      id,
      organizationId,
    });
    if (!options?.includeAll) {
      where.isPublic = true;
      where.isActive = true;
    }
    const employee = await this.prisma.employee.findFirst({
      where,
      include: {
        user: { select: { id: true, email: true } },
        organization: true,
        position: true,
      },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async findByUserId(
    userId: string,
    organizationId: string,
    options?: { includeAll?: boolean },
  ) {
    const where: Record<string, unknown> = this.prisma.notDeleted({
      userId,
      organizationId,
    });
    if (!options?.includeAll) {
      where.isPublic = true;
      where.isActive = true;
    }
    return this.prisma.employee.findMany({
      where,
      include: { organization: true, position: true },
    });
  }

  async update(id: string, dto: UpdateEmployeeInput, organizationId?: string) {
    await this.findOne(id, organizationId!, { includeAll: true });
    return this.prisma.employee.update({
      where: { id },
      data: dto,
      include: { user: { select: { id: true, email: true } }, organization: true, position: true },
    });
  }

  async remove(id: string, organizationId?: string) {
    await this.findOne(id, organizationId!, { includeAll: true });
    return this.prisma.softDelete(this.prisma.employee, { id });
  }
}
