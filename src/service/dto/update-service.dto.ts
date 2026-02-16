import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const updateServiceSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(2000).optional(),
  photo: z.string().url().optional().nullable(),
  price: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
  durationMax: z.number().int().positive().optional().nullable(),
});

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Updated Haircut' })
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-photo.jpg' })
  photo?: string | null;

  @ApiPropertyOptional({ example: 30.0 })
  price?: number;

  @ApiPropertyOptional({ example: 45 })
  duration?: number;

  @ApiPropertyOptional({ example: 60, description: 'Max duration (null to make fixed)' })
  durationMax?: number | null;
}
