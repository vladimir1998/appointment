import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  password: string;
}
