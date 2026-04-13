import { Body, Controller, Get, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { RegisterDto, registerSchema } from '../auth/dto/register.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('create')
  @ApiOperation({
    summary: 'Создать пользователя',
    description:
      'Создаёт User (email, password) и запись Client с firstName, lastName и опциональным phone. Токены не выдаются — вход через POST /auth/login.',
  })
  @UsePipes(new ZodValidationPipe(registerSchema))
  create(@Body() dto: RegisterDto) {
    return this.authService.createUserOnly(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Req() req: Request) {
    return this.userService.findById((req.user as any).id);
  }
}
