import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const timeIntervalSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const workScheduleEntrySchema = z.object({
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  isWorking: z.boolean(),
  intervals: z.array(timeIntervalSchema),
});

export const registerEmployeeSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100).optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  photo: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  about: z.array(z.string()).optional(),
  education: z.array(z.string()).optional(),
  certificates: z.array(z.string()).optional(),
  workSchedule: z.array(workScheduleEntrySchema).optional(),
  serviceIds: z.array(z.uuid()).optional(),
  specialtyIds: z.array(z.uuid()).optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
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

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  photo?: string;

  @ApiPropertyOptional({ example: 'Experienced specialist' })
  description?: string;

  @ApiPropertyOptional({ example: ['Hair styling', 'Coloring'] })
  about?: string[];

  @ApiPropertyOptional({ example: ['Bachelor in Cosmetology'] })
  education?: string[];

  @ApiPropertyOptional({ example: ['Certificate A', 'Certificate B'] })
  certificates?: string[];

  @ApiPropertyOptional({
    example: [{ day: 'monday', isWorking: true, intervals: [{ startTime: '09:00', endTime: '18:00' }] }],
  })
  workSchedule?: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    isWorking: boolean;
    intervals: { startTime: string; endTime: string }[];
  }[];

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'] })
  serviceIds?: string[];

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'] })
  specialtyIds?: string[];

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  isPublic?: boolean;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID должности' })
  positionId?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  organizationId: string;
}
