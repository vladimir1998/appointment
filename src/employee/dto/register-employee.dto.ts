import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const registerEmployeeSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  positionId: z.uuid().optional(),
  organizationId: z.uuid(),
});

export type RegisterEmployeeInput = z.infer<typeof registerEmployeeSchema>;

export class RegisterEmployeeDto {
  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'secret123' })
  password: string;

  @ApiProperty({ example: 'John', description: 'Имя для записи Client (не хранится в employees)' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Фамилия для записи Client' })
  lastName: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Телефон для записи Client' })
  phone?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID должности' })
  positionId?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  organizationId: string;
}
