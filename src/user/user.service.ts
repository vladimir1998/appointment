import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        clients: {
          where: { deletedAt: null },
          take: 1,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, clients, ...rest } = user;
    return {
      ...rest,
      client: clients[0] ?? null,
    };
  }
}
