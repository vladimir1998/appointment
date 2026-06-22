import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

const timeIntervalSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const workScheduleEntrySchema = z.object({
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  isWorking: z.boolean(),
  intervals: z.array(timeIntervalSchema),
});

export const updateEmployeeSchema = z.object({
  // Employee fields
  positionId: z.uuid().optional().nullable(),
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  photo: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  about: z.array(z.string()).optional(),
  workSchedule: z.array(workScheduleEntrySchema).optional(),
  experienceYears: z.number().int().min(0).optional(),
  education: z.array(z.string()).optional(),
  certificates: z.array(z.string()).optional(),
  // Client fields (firstName, lastName, phone)
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  serviceIds: z.array(z.uuid()).optional(),
  specialtyIds: z.array(z.uuid()).optional(),
  // User fields (email)
  email: z.email().optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID должности (null — снять должность)' })
  positionId?: string | null;

  @ApiPropertyOptional({ enum: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'] })
  role?: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  isPublic?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  photo?: string;

  @ApiPropertyOptional({ example: 'Experienced specialist' })
  description?: string;

  @ApiPropertyOptional({ example: ['Hair styling', 'Coloring'] })
  about?: string[];

  @ApiPropertyOptional({
    example: [{ day: 'monday', isWorking: true, intervals: [{ startTime: '09:00', endTime: '18:00' }] }],
  })
  workSchedule?: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    isWorking: boolean;
    intervals: { startTime: string; endTime: string }[];
  }[];

  @ApiPropertyOptional({ example: 5 })
  experienceYears?: number;

  @ApiPropertyOptional({ example: ['Bachelor in Cosmetology'] })
  education?: string[];

  @ApiPropertyOptional({ example: ['Certificate A', 'Certificate B'] })
  certificates?: string[];

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string | null;

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'] })
  serviceIds?: string[];

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'] })
  specialtyIds?: string[];

  @ApiPropertyOptional({ example: 'john@example.com' })
  email?: string;
}
