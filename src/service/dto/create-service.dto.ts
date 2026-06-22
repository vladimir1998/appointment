import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const priceTypeValues = ['exact', 'approximate', 'from', 'range'] as const;
export type PriceType = typeof priceTypeValues[number];

export const createServiceSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(2000),
  photo: z.string().url().optional(),
  price: z.coerce.number().min(0),
  priceMax: z.coerce.number().min(0).optional(),
  priceType: z.enum(priceTypeValues).optional(),
  priceComment: z.string().max(500).optional(),
  duration: z.coerce.number().int().min(0),
  durationMax: z.coerce.number().int().positive().optional(),
  about: z.array(z.string()).optional(),
  organizationId: z.string().uuid(),
}).refine(
  (data) => !data.durationMax || data.durationMax > data.duration,
  { message: 'durationMax must be greater than duration', path: ['durationMax'] },
).refine(
  (data) => !data.priceMax || data.priceMax > data.price,
  { message: 'priceMax must be greater than price', path: ['priceMax'] },
);

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export class CreateServiceDto {
  @ApiProperty({ example: 'Haircut' })
  title: string;

  @ApiProperty({ example: 'Professional haircut service' })
  description: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  photo?: string;

  @ApiProperty({ example: 25.0 })
  price: number;

  @ApiPropertyOptional({ example: 50.0, description: 'Max price for range/approximate types' })
  priceMax?: number;

  @ApiPropertyOptional({ enum: priceTypeValues, example: 'exact' })
  priceType?: PriceType;

  @ApiPropertyOptional({ example: 'Depends on hair length' })
  priceComment?: string;

  @ApiProperty({ example: 30, description: 'Duration in minutes' })
  duration: number;

  @ApiPropertyOptional({ example: 60, description: 'Max duration in minutes (null = fixed)' })
  durationMax?: number;

  @ApiPropertyOptional({ example: ['Block 1', 'Block 2'] })
  about?: string[];

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  organizationId: string;
}
