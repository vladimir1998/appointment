import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'Hairdresser' })
  position?: string | null;

  @ApiPropertyOptional({ enum: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'] })
  role?: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
