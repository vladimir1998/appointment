import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const clientApiUpdateAppointmentSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().min(1).max(2000).optional().nullable(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    employeeId: z.uuid().optional(),
    serviceId: z.uuid().optional(),
  })
  .refine(
    (data) => !data.startTime || !data.endTime || data.endTime > data.startTime,
    { message: 'endTime must be after startTime', path: ['endTime'] },
  );

export type ClientApiUpdateAppointmentInput = z.infer<typeof clientApiUpdateAppointmentSchema>;

export class ClientApiUpdateAppointmentDto {
  @ApiPropertyOptional({ example: 'Updated appointment' })
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  description?: string | null;

  @ApiPropertyOptional({ example: '2026-05-01T10:00:00.000Z' })
  startTime?: Date;

  @ApiPropertyOptional({ example: '2026-05-01T10:30:00.000Z' })
  endTime?: Date;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  employeeId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  serviceId?: string;
}
