import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatusEnum, AppointmentStatus } from './create-appointment.dto';

export const updateAppointmentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(2000).optional().nullable(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  status: z.enum(AppointmentStatusEnum).optional(),
  clientId: z.uuid().optional(),
  employeeId: z.uuid().optional(),
  serviceId: z.uuid().optional(),
});

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ example: 'Updated appointment' })
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  description?: string | null;

  @ApiPropertyOptional({ example: '2026-02-22T10:00:00.000Z' })
  startTime?: Date;

  @ApiPropertyOptional({ example: '2026-02-22T10:30:00.000Z' })
  endTime?: Date;

  @ApiPropertyOptional({ enum: AppointmentStatusEnum })
  status?: AppointmentStatus;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  clientId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  employeeId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  serviceId?: string;
}
