import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const createAppointmentSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(2000).optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  clientId: z.uuid(),
  employeeId: z.uuid(),
  serviceId: z.uuid(),
  organizationId: z.uuid(),
}).refine((data) => data.endTime > data.startTime, {
  message: 'endTime must be after startTime',
  path: ['endTime'],
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export class CreateAppointmentDto {
  @ApiProperty({ example: 'Haircut appointment' })
  title: string;

  @ApiPropertyOptional({ example: 'Client requested short haircut' })
  description?: string;

  @ApiProperty({ example: '2026-02-22T10:00:00.000Z' })
  startTime: Date;

  @ApiProperty({ example: '2026-02-22T10:30:00.000Z' })
  endTime: Date;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  clientId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  employeeId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  serviceId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  organizationId: string;
}
