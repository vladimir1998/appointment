import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const updateSpecialtySchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export type UpdateSpecialtyInput = z.infer<typeof updateSpecialtySchema>;

export class UpdateSpecialtyDto {
  @ApiPropertyOptional({
    example: 'Стоматолог',
    description: 'Новое название специальности',
  })
  name?: string;
}
