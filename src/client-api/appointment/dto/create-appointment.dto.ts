import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const clientApiCreateAppointmentSchema = z
  .object({
    title: z.string().min(1).max(255),
    description: z.string().min(1).max(2000).optional(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    employeeId: z.uuid(),
    serviceId: z.uuid(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

export type ClientApiCreateAppointmentInput = z.infer<typeof clientApiCreateAppointmentSchema>;

export class ClientApiCreateAppointmentDto {
  @ApiProperty({ example: 'Haircut appointment' })
  title: string;

  @ApiPropertyOptional({ example: 'Short haircut please' })
  description?: string;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  startTime: Date;

  @ApiProperty({ example: '2026-05-01T10:30:00.000Z' })
  endTime: Date;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  employeeId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  serviceId: string;
}
