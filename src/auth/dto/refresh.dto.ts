import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const refreshSchema = z.object({
  refreshToken: z.string().uuid(),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

export class RefreshDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  refreshToken: string;
}
