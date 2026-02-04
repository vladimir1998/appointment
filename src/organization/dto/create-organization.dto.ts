import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export class CreateOrganizationDto {
  @ApiProperty({ example: 'My Organization' })
  name: string;

  @ApiPropertyOptional({ example: 'Organization description' })
  description?: string;
}
