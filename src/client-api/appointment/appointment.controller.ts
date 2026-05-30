import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/auth-context.types';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ClientApiAppointmentService } from './appointment.service';
import {
  ClientApiCreateAppointmentDto,
  clientApiCreateAppointmentSchema,
} from './dto/create-appointment.dto';
import {
  ClientApiUpdateAppointmentDto,
  clientApiUpdateAppointmentSchema,
} from './dto/update-appointment.dto';

@ApiTags('Client API / Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('client-api/appointments')
export class ClientApiAppointmentController {
  constructor(private appointmentService: ClientApiAppointmentService) {}

  @Get()
  @ApiOperation({ summary: 'Мои записи' })
  @ApiQuery({ name: 'organizationId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'serviceId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'employeeId', required: false, type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Список записей' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findAll(
    @CurrentUser() user: RequestUser,
    @Query('organizationId') organizationId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.appointmentService.findAll(user.id, { organizationId, serviceId, employeeId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Моя запись по ID' })
  @ApiQuery({ name: 'organizationId', required: false, type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Данные записи' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Запись не найдена' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.appointmentService.findOne(id, user.id, organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Создать запись' })
  @ApiQuery({ name: 'organizationId', required: false, type: String, format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Запись создана' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Профиль клиента не найден' })
  @UsePipes(new ZodValidationPipe(clientApiCreateAppointmentSchema))
  create(
    @Body() dto: ClientApiCreateAppointmentDto,
    @CurrentUser() user: RequestUser,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.appointmentService.create(user.id, dto, organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить запись' })
  @ApiQuery({ name: 'organizationId', required: false, type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Запись обновлена' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Запись не найдена' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(clientApiUpdateAppointmentSchema)) dto: ClientApiUpdateAppointmentDto,
    @CurrentUser() user: RequestUser,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.appointmentService.update(id, user.id, dto, organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Отменить запись' })
  @ApiQuery({ name: 'organizationId', required: false, type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Запись удалена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Запись не найдена' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.appointmentService.remove(id, user.id, organizationId);
  }
}
