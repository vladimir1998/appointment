import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const createPositionSchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string().uuid()).default([]),
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
    example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
    description: 'Массив уникальных идентификаторов прав (Permission)',
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
