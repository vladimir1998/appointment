import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  photo: true,
  bio: true,
  createdAt: true,
} as const;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(email?: string) {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(email ? { email: { contains: email, mode: 'insensitive' } } : {}),
      },
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, deletedAt: null },
      select: userSelect,
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        globalPosition: { select: { id: true, name: true } },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...rest } = user;
    return rest;
  }
}
