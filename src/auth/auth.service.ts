import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterInput } from './dto/register.dto';
import { LoginInput } from './dto/login.dto';
import { RefreshInput } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /** Создание учётной записи без выдачи токенов (например POST /users/create). */
  async createUserOnly(dto: RegisterInput) {
    const { user, client } = await this.createUserWithClient(dto);
    const { password: _p, ...userSafe } = user;
    return {
      ...userSafe,
      client: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
      },
    };
  }

  async register(dto: RegisterInput) {
    const { user } = await this.createUserWithClient(dto);
    return this.generateTokens(user.id, user.email);
  }

  /** User — только учётные данные; имя/телефон — в `Client`. */
  private async createUserWithClient(dto: RegisterInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hash,
        },
      });

      const client = await tx.client.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          userId: user.id,
          ...(dto.phone != null ? { phone: dto.phone } : {}),
        },
      });

      return { user, client };
    });
  }

  async login(dto: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        employees: {
          where: { deletedAt: null, isActive: true },
          include: { organization: { select: { id: true, name: true } }, position: true },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        isEmployee: user.employees.length > 0,
        employees: user.employees.map((emp) => ({
          id: emp.id,
          role: emp.role,
          position: emp.position,
          organization: emp.organization,
        })),
      },
    };
  }

  async refresh(dto: RefreshInput) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.generateTokens(stored.user.id, stored.user.email);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return { message: 'Logged out from all devices' };
  }

  private async generateTokens(userId: string, email: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      { expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m') },
    );

    const refreshToken = randomUUID();
    const refreshExpiresIn = this.config.get('JWT_REFRESH_EXPIRES', '7d');
    const expiresAt = this.calculateExpiry(refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private calculateExpiry(duration: string): Date {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit] || 86400000;

    return new Date(Date.now() + value * ms);
  }
}
