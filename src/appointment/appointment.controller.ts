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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
  @ApiOperation({ summary: 'Список записей организации' })
  @ApiQuery({ name: 'organizationId', type: String, description: 'ID организации' })
  @ApiResponse({ status: 200, description: 'Список записей' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findAll(@Query('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.appointmentService.findAllByOrganization(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить запись по ID' })
  @ApiResponse({ status: 200, description: 'Данные записи' })
  @ApiResponse({ status: 404, description: 'Запись не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить запись' })
  @ApiResponse({ status: 200, description: 'Запись обновлена' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 404, description: 'Запись не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateAppointmentSchema)) dto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить запись (soft delete)' })
  @ApiResponse({ status: 200, description: 'Запись удалена' })
  @ApiResponse({ status: 404, description: 'Запись не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.remove(id);
  }
}
