import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

const permissionRegex = /^[a-z_]+:[a-z_]+$/;

export const updatePositionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z
    .array(z.string().regex(permissionRegex, 'Permission must be in format resource:action'))
    .optional(),
});

export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;

export class UpdatePositionDto {
  @ApiPropertyOptional({
    example: 'Менеджер',
    description: 'Новое название должности',
  })
  name?: string;

  @ApiPropertyOptional({
    example: ['services:read', 'appointments:read'],
    description:
      'Полный список прав (заменяет текущий). Формат: resource:action. Доступные ресурсы: services, employees, clients, appointments, positions. Доступные действия: read, create, update, delete.',
    type: [String],
  })
  permissions?: string[];
}
