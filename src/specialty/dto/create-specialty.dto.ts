import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const createSpecialtySchema = z.object({
  name: z.string().min(1).max(100),
  organizationId: z.uuid(),
});

export type CreateSpecialtyInput = z.infer<typeof createSpecialtySchema>;

export class CreateSpecialtyDto {
  @ApiProperty({
    example: 'Кардиолог',
    description: 'Название специальности',
  })
  name: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID организации, к которой привязана специальность',
  })
  organizationId: string;
}
