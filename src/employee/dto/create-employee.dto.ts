import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const createEmployeeSchema = z.object({
  positionId: z.uuid().optional(),
  userId: z.uuid(),
  /** Можно передать в теле или через заголовок x-organization-id */
  organizationId: z.uuid().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export class CreateEmployeeDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID должности' })
  positionId?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID организации; можно не указывать, если передан заголовок x-organization-id',
  })
  organizationId?: string;
}
