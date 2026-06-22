import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).max(120),
  lastName: z.string().min(1).max(120),
  phone: z.string().min(1).max(32).optional(),
  photo: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  password: string;

  @ApiProperty({ example: 'Иван' })
  firstName: string;

  @ApiProperty({ example: 'Иванов' })
  lastName: string;

  @ApiPropertyOptional({ example: '+79001234567' })
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  photo?: string;

  @ApiPropertyOptional({ example: 'Краткое описание' })
  bio?: string;
}
