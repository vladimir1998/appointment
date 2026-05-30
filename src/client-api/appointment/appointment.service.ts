import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientApiCreateAppointmentInput } from './dto/create-appointment.dto';
import { ClientApiUpdateAppointmentInput } from './dto/update-appointment.dto';

const appointmentSelect = {
  id: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  status: true,
  employee: {
    select: {
      id: true,
      position: { select: { id: true, name: true } },
      user: { select: { email: true } },
    },
  },
  service: { select: { id: true, title: true, price: true, duration: true } },
} as const;

@Injectable()
export class ClientApiAppointmentService {
  constructor(private prisma: PrismaService) {}

  private async resolveClientId(userId: string): Promise<string> {
    const client = await this.prisma.client.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    if (!client) {
      throw new NotFoundException('Client profile not found for current user');
    }
    return client.id;
  }

  async findAll(
    userId: string,
    filters: { organizationId?: string; serviceId?: string; employeeId?: string } = {},
  ) {
    const clientId = await this.resolveClientId(userId);
    const { organizationId, serviceId, employeeId } = filters;
    return this.prisma.appointment.findMany({
      where: this.prisma.notDeleted({
        clientId,
        ...(organizationId && { organizationId }),
        ...(serviceId && { serviceId }),
        ...(employeeId && { employeeId }),
      }),
      select: appointmentSelect,
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string, userId: string, organizationId?: string) {
    const clientId = await this.resolveClientId(userId);
    const appointment = await this.prisma.appointment.findFirst({
      where: this.prisma.notDeleted({
        id,
        clientId,
        ...(organizationId && { organizationId }),
      }),
      select: appointmentSelect,
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async create(
    userId: string,
    dto: ClientApiCreateAppointmentInput,
    organizationId?: string,
  ) {
    const clientId = await this.resolveClientId(userId);

    const [employee, service] = await Promise.all([
      this.prisma.employee.findFirst({
        where: this.prisma.notDeleted({
          id: dto.employeeId,
          isActive: true,
          ...(organizationId && { organizationId }),
        }),
      }),
      this.prisma.service.findFirst({
        where: this.prisma.notDeleted({
          id: dto.serviceId,
          isActive: true,
          ...(organizationId && { organizationId }),
        }),
      }),
    ]);

    if (!employee) throw new BadRequestException('Employee not found');
    if (!service) throw new BadRequestException('Service not found');

    return this.prisma.appointment.create({
      data: {
        ...dto,
        clientId,
        organizationId: organizationId ?? employee.organizationId,
      },
      select: appointmentSelect,
    });
  }

  async update(
    id: string,
    userId: string,
    dto: ClientApiUpdateAppointmentInput,
    organizationId?: string,
  ) {
    const existing = await this.findOne(id, userId, organizationId);
    const effectiveOrgId = organizationId ?? existing.employee.id;

    if (dto.employeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: this.prisma.notDeleted({
          id: dto.employeeId,
          isActive: true,
          ...(effectiveOrgId && { organizationId: effectiveOrgId }),
        }),
      });
      if (!employee) throw new BadRequestException('Employee not found');
    }

    if (dto.serviceId) {
      const service = await this.prisma.service.findFirst({
        where: this.prisma.notDeleted({
          id: dto.serviceId,
          isActive: true,
          ...(effectiveOrgId && { organizationId: effectiveOrgId }),
        }),
      });
      if (!service) throw new BadRequestException('Service not found');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: dto,
      select: appointmentSelect,
    });
  }

  async remove(id: string, userId: string, organizationId?: string) {
    await this.findOne(id, userId, organizationId);
    return this.prisma.softDelete(this.prisma.appointment, { id });
  }
}
