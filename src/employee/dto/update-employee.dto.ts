import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const updateEmployeeSchema = z.object({
  positionId: z.uuid().optional().nullable(),
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID должности (null — снять должность)' })
  positionId?: string | null;

  @ApiPropertyOptional({ enum: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'] })
  role?: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
