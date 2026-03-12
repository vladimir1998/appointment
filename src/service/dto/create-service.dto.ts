import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const createServiceSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(2000),
  photo: z.url().optional(),
  price: z.coerce.number().min(0).optional(),
  duration: z.coerce.number().int().min(0).optional(),
  durationMax: z.coerce.number().int().positive().optional(),
  organizationId: z.uuid(),
}).refine(
  (data) => !data.durationMax || data.duration == null || data.durationMax > data.duration,
  { message: 'durationMax must be greater than duration', path: ['durationMax'] },
);

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export class CreateServiceDto {
  @ApiProperty({ example: 'Haircut' })
  title: string;

  @ApiProperty({ example: 'Professional haircut service' })
  description: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  photo?: string;

  @ApiPropertyOptional({ example: 25.0, description: 'Price in currency units (optional, can be 0)' })
  price?: number;

  @ApiPropertyOptional({ example: 30, description: 'Duration in minutes (optional, can be 0)' })
  duration?: number;

  @ApiPropertyOptional({ example: 60, description: 'Max duration in minutes (null = fixed duration)' })
  durationMax?: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  organizationId: string;
}
