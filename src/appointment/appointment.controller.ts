import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/auth-context.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto, createAppointmentSchema } from './dto/create-appointment.dto';
import { UpdateAppointmentDto, updateAppointmentSchema } from './dto/update-appointment.dto';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({ summary: 'Создать запись' })
  @ApiResponse({ status: 201, description: 'Запись создана' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @UsePipes(new ZodValidationPipe(createAppointmentSchema))
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Список записей текущего пользователя как клиента',
    description:
      'Только записи, у которых клиент (Client) привязан к этому пользователю: client.userId совпадает с id из JWT.',
  })
  @ApiResponse({ status: 200, description: 'Список записей' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findAll(@CurrentUser() user: RequestUser) {
    return this.appointmentService.findAllForCurrentUser(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить запись по ID',
    description:
      'Доступно только если у записи client.userId совпадает с пользователем из JWT.',
  })
  @ApiResponse({ status: 200, description: 'Данные записи' })
  @ApiResponse({ status: 404, description: 'Нет доступа или запись не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.appointmentService.findOneForClientUser(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Обновить запись',
    description:
      'Доступно только если у записи client.userId совпадает с пользователем из JWT.',
  })
  @ApiResponse({ status: 200, description: 'Запись обновлена' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 404, description: 'Нет доступа или запись не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateAppointmentSchema)) dto: UpdateAppointmentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.appointmentService.updateForClientUser(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить запись (soft delete)',
    description:
      'Доступно только если у записи client.userId совпадает с пользователем из JWT.',
  })
  @ApiResponse({ status: 200, description: 'Запись удалена' })
  @ApiResponse({ status: 404, description: 'Нет доступа или запись не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.appointmentService.removeForClientUser(id, user.id);
  }
}
