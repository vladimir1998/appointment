import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const updateClientSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'Jane' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Smith' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'Updated notes' })
  notes?: string | null;
}
