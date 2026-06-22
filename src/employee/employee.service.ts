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

const employeeUserInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      photo: true,
      bio: true,
    },
  },
} as const;

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

    const hash = await (bcrypt.hash(dto.password ?? '', 10) as Promise<string>);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          ...(dto.phone != null ? { phone: dto.phone } : {}),
        },
      });

      return tx.employee.create({
        data: {
          positionId: dto.positionId,
          userId: user.id,
          organizationId: dto.organizationId,
          ...(dto.firstName != null ? { firstName: dto.firstName } : {}),
          ...(dto.lastName != null ? { lastName: dto.lastName } : {}),
          ...(dto.phone != null ? { phone: dto.phone } : {}),
          ...(dto.photo != null ? { photo: dto.photo } : {}),
          ...(dto.description != null ? { description: dto.description } : {}),
          ...(dto.about != null ? { about: dto.about } : {}),
          ...(dto.education != null ? { education: dto.education } : {}),
          ...(dto.certificates != null ? { certificates: dto.certificates } : {}),
          ...(dto.workSchedule != null ? { workSchedule: dto.workSchedule } : {}),
          ...(dto.isActive != null ? { isActive: dto.isActive } : {}),
          ...(dto.isPublic != null ? { isPublic: dto.isPublic } : {}),
          ...(dto.serviceIds?.length
            ? { services: { connect: dto.serviceIds.map((id) => ({ id })) } }
            : {}),
          ...(dto.specialtyIds?.length
            ? { specialties: { connect: dto.specialtyIds.map((id) => ({ id })) } }
            : {}),
        },
        include: {
          ...employeeUserInclude,
          organization: true,
          position: true,
          services: true,
          specialties: true,
        },
      });
    });
  }

  async create(dto: CreateEmployeeInput & { organizationId: string }) {
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
      data: {
        userId: dto.userId,
        organizationId: dto.organizationId,
        ...(dto.positionId != null ? { positionId: dto.positionId } : {}),
        ...(dto.firstName != null ? { firstName: dto.firstName } : {}),
        ...(dto.lastName != null ? { lastName: dto.lastName } : {}),
        ...(dto.phone != null ? { phone: dto.phone } : {}),
        ...(dto.photo != null ? { photo: dto.photo } : {}),
        ...(dto.description != null ? { description: dto.description } : {}),
        ...(dto.about != null ? { about: dto.about } : {}),
        ...(dto.education != null ? { education: dto.education } : {}),
        ...(dto.certificates != null ? { certificates: dto.certificates } : {}),
        ...(dto.workSchedule != null ? { workSchedule: dto.workSchedule } : {}),
        ...(dto.isActive != null ? { isActive: dto.isActive } : {}),
        ...(dto.isPublic != null ? { isPublic: dto.isPublic } : {}),
        ...(dto.serviceIds?.length
          ? { services: { connect: dto.serviceIds.map((id) => ({ id })) } }
          : {}),
        ...(dto.specialtyIds?.length
          ? { specialties: { connect: dto.specialtyIds.map((id) => ({ id })) } }
          : {}),
      },
      include: {
        ...employeeUserInclude,
        organization: true,
        position: true,
        services: true,
        specialties: true,
      },
    });
  }

  /** Все сотрудники в системе (для пользователя с глобальным employee:read без x-organization-id). */
  async findAllSystemWide(options?: { includeAll?: boolean }) {
    const where: Record<string, unknown> = this.prisma.notDeleted({});
    if (!options?.includeAll) {
      where.isPublic = true;
      where.isActive = true;
    }
    return this.prisma.employee.findMany({
      where,
      include: { ...employeeUserInclude, position: true, services: true, specialties: true },
      orderBy: { createdAt: 'desc' },
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
      include: { ...employeeUserInclude, position: true, services: true, specialties: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * @param organizationId — если задан, сотрудник должен принадлежать этой организации;
   *   если нет (глобальный доступ), достаточно id.
   */
  async findOne(
    id: string,
    organizationId: string | undefined,
    options?: { includeAll?: boolean },
  ) {
    const where: Record<string, unknown> = this.prisma.notDeleted({ id });
    if (organizationId) {
      where.organizationId = organizationId;
    }
    if (!options?.includeAll) {
      where.isPublic = true;
      where.isActive = true;
    }
    const employee = await this.prisma.employee.findFirst({
      where,
      include: {
        ...employeeUserInclude,
        organization: true,
        position: true,
        services: true,
        specialties: true,
      },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async findByUserId(
    userId: string,
    organizationId: string | undefined,
    options?: { includeAll?: boolean },
  ) {
    const where: Record<string, unknown> = this.prisma.notDeleted({ userId });
    if (organizationId) {
      where.organizationId = organizationId;
    }
    if (!options?.includeAll) {
      where.isPublic = true;
      where.isActive = true;
    }
    return this.prisma.employee.findMany({
      where,
      include: { ...employeeUserInclude, organization: true, position: true, services: true, specialties: true },
    });
  }

  async update(
    id: string,
    dto: UpdateEmployeeInput,
    organizationId?: string,
  ) {
    const employee = await this.findOne(id, organizationId, { includeAll: true });

    const { email, serviceIds, specialtyIds, ...employeeData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const userUpdate: Record<string, unknown> = {};
      if (email != null) userUpdate.email = email;

      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: employee.userId },
          data: userUpdate,
        });
      }

      return tx.employee.update({
        where: { id },
        data: {
          ...employeeData,
          ...(serviceIds != null
            ? { services: { set: serviceIds.map((sid) => ({ id: sid })) } }
            : {}),
          ...(specialtyIds != null
            ? { specialties: { set: specialtyIds.map((sid) => ({ id: sid })) } }
            : {}),
        },
        include: {
          ...employeeUserInclude,
          organization: true,
          position: true,
          services: true,
          specialties: true,
        },
      });
    });
  }

  async remove(id: string, organizationId?: string) {
    await this.findOne(id, organizationId, { includeAll: true });
    return this.prisma.softDelete(this.prisma.employee, { id });
  }
}
