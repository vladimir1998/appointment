import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

const permissionRegex = /^[a-z_]+:[a-z_]+$/;

export const createPositionSchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z
    .array(z.string().regex(permissionRegex, 'Permission must be in format resource:action'))
    .default([]),
  organizationId: z.uuid(),
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;

export class CreatePositionDto {
  @ApiProperty({
    example: 'Администратор',
    description: 'Название должности',
  })
  name: string;

  @ApiProperty({
    example: ['services:read', 'services:create', 'appointments:read'],
    description:
      'Список прав в формате resource:action. Доступные ресурсы: services, employees, clients, appointments, positions. Доступные действия: read, create, update, delete.',
    type: [String],
    default: [],
  })
  permissions: string[];

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID организации, к которой привязана должность',
  })
  organizationId: string;
}
