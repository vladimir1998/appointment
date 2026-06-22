import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { priceTypeValues, PriceType } from './create-service.dto';

export const updateServiceSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(2000).optional(),
  photo: z.string().url().optional().nullable(),
  price: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional().nullable(),
  priceType: z.enum(priceTypeValues).optional(),
  priceComment: z.string().max(500).optional().nullable(),
  duration: z.coerce.number().int().min(0).optional(),
  durationMax: z.coerce.number().int().positive().optional().nullable(),
  about: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
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

  @ApiPropertyOptional({ example: 60.0 })
  priceMax?: number | null;

  @ApiPropertyOptional({ enum: priceTypeValues, example: 'range' })
  priceType?: PriceType;

  @ApiPropertyOptional({ example: 'Depends on complexity' })
  priceComment?: string | null;

  @ApiPropertyOptional({ example: 45 })
  duration?: number;

  @ApiPropertyOptional({ example: 60 })
  durationMax?: number | null;

  @ApiPropertyOptional({ example: ['Block 1'] })
  about?: string[];

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
