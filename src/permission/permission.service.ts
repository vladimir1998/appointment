import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.permission.findMany({
      where: this.prisma.notDeleted(),
      orderBy: { value: 'asc' },
    });
  }
}
