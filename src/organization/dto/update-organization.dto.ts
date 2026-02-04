import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Updated Organization Name' })
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  description?: string | null;
}
