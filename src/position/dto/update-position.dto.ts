import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const updatePositionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(z.string().uuid()).optional(),
});

export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;

export class UpdatePositionDto {
  @ApiPropertyOptional({
    example: 'Менеджер',
    description: 'Новое название должности',
  })
  name?: string;

  @ApiPropertyOptional({
    example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
    description: 'Массив уникальных идентификаторов прав (заменяет текущий список)',
    type: [String],
  })
  permissions?: string[];
}
