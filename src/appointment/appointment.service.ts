import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentInput } from './dto/create-appointment.dto';
import { UpdateAppointmentInput } from './dto/update-appointment.dto';

const appointmentInclude = {
  client: { select: { id: true, firstName: true, lastName: true, phone: true } },
  employee: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          email: true,
          clients: {
            where: { deletedAt: null },
            take: 1,
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
        },
      },
    },
  },
  service: { select: { id: true, title: true, price: true, duration: true } },
} as const;

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  private async validateRelations(ids: {
    clientId?: string;
    employeeId?: string;
    serviceId?: string;
  }) {
    const checks = await Promise.all([
      ids.clientId
        ? this.prisma.client.findFirst({ where: { id: ids.clientId, deletedAt: null } })
        : true,
      ids.employeeId
        ? this.prisma.employee.findFirst({ where: { id: ids.employeeId, deletedAt: null } })
        : true,
      ids.serviceId
        ? this.prisma.service.findFirst({ where: { id: ids.serviceId, deletedAt: null } })
        : true,
    ]);
    if (checks[0] === null) throw new BadRequestException('Client not found');
    if (checks[1] === null) throw new BadRequestException('Employee not found');
    if (checks[2] === null) throw new BadRequestException('Service not found');
  }

  async create(dto: CreateAppointmentInput) {
    await this.validateRelations({
      clientId: dto.clientId,
      employeeId: dto.employeeId,
      serviceId: dto.serviceId,
    });
    return this.prisma.appointment.create({
      data: dto,
      include: appointmentInclude,
    });
  }

  async findAllByOrganization(organizationId: string) {
    return this.prisma.appointment.findMany({
      where: this.prisma.notDeleted({ organizationId }),
      include: appointmentInclude,
      orderBy: { startTime: 'asc' },
    });
  }

  /** Записи, где клиент привязан к текущему пользователю (client.userId). */
  async findAllForCurrentUser(userId: string) {
    return this.prisma.appointment.findMany({
      where: this.prisma.notDeleted({
        client: this.prisma.notDeleted({ userId }),
      }),
      include: appointmentInclude,
      orderBy: { startTime: 'asc' },
    });
  }

  /** Одна запись только если клиент привязан к этому пользователю (client.userId). */
  async findOneForClientUser(id: string, userId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: this.prisma.notDeleted({
        id,
        client: this.prisma.notDeleted({ userId }),
      }),
      include: appointmentInclude,
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async updateForClientUser(
    id: string,
    userId: string,
    dto: UpdateAppointmentInput,
  ) {
    await this.findOneForClientUser(id, userId);
    await this.validateRelations({
      clientId: dto.clientId,
      employeeId: dto.employeeId,
      serviceId: dto.serviceId,
    });
    return this.prisma.appointment.update({
      where: { id },
      data: dto,
      include: appointmentInclude,
    });
  }

  async removeForClientUser(id: string, userId: string) {
    await this.findOneForClientUser(id, userId);
    return this.prisma.softDelete(this.prisma.appointment, { id });
  }
}
