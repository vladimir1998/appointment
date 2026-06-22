import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInviteInput } from './dto/create-invite.dto';

const inviteInclude = {
  user: {
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, photo: true },
  },
  organization: { select: { id: true, name: true } },
  invitedBy: {
    select: { id: true, email: true, firstName: true, lastName: true },
  },
} as const;

@Injectable()
export class InviteService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInviteInput, organizationId: string, invitedById: string) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.invite.findUnique({
      where: { userId_organizationId: { userId: dto.userId, organizationId } },
    });
    if (existing) throw new ConflictException('Invite already sent to this user for this organization');

    return this.prisma.invite.create({
      data: {
        userId: dto.userId,
        organizationId,
        invitedById,
        ...(dto.expiresAt != null ? { expiresAt: dto.expiresAt } : {}),
      },
      include: inviteInclude,
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.invite.findMany({
      where: { organizationId },
      include: inviteInclude,
      orderBy: { sentAt: 'desc' },
    });
  }

  async accept(id: string, userId: string) {
    const invite = await this.prisma.invite.findUnique({ where: { id } });
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.userId !== userId) throw new BadRequestException('This invite is not for you');
    if (invite.acceptedAt) throw new ConflictException('Invite already accepted');
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    return this.prisma.invite.update({
      where: { id },
      data: { acceptedAt: new Date() },
      include: inviteInclude,
    });
  }

  async remove(id: string, organizationId: string) {
    const invite = await this.prisma.invite.findUnique({ where: { id } });
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.organizationId !== organizationId) throw new NotFoundException('Invite not found');

    return this.prisma.invite.delete({ where: { id } });
  }
}
