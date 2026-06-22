import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const createInviteSchema = z.object({
  userId: z.string().uuid(),
  expiresAt: z.coerce.date().optional(),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;

export class CreateInviteDto {
  @ApiProperty({ example: 'uuid-of-user' })
  userId: string;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00Z' })
  expiresAt?: Date;
}
