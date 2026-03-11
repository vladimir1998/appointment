import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentInput } from './dto/create-appointment.dto';
import { UpdateAppointmentInput } from './dto/update-appointment.dto';

const appointmentInclude = {
  client: { select: { id: true, firstName: true, lastName: true, phone: true } },
  employee: { select: { id: true, firstName: true, lastName: true } },
  service: { select: { id: true, title: true, price: true, duration: true } },
} as const;

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentInput) {
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

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: this.prisma.notDeleted({ id }),
      include: appointmentInclude,
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentInput) {
    await this.findOne(id);
    return this.prisma.appointment.update({
      where: { id },
      data: dto,
      include: appointmentInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.softDelete(this.prisma.appointment, { id });
  }
}
