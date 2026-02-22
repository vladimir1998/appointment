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
import { PositionService } from './position.service';
import { CreatePositionDto, createPositionSchema } from './dto/create-position.dto';
import { UpdatePositionDto, updatePositionSchema } from './dto/update-position.dto';

@ApiTags('Positions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('positions')
export class PositionController {
  constructor(private positionService: PositionService) {}

  @Post()
  @ApiOperation({
    summary: 'Создать должность',
    description: 'Создаёт новую должность для организации с заданным набором прав доступа.',
  })
  @ApiResponse({ status: 201, description: 'Должность успешно создана' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации данных' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @UsePipes(new ZodValidationPipe(createPositionSchema))
  create(@Body() dto: CreatePositionDto) {
    return this.positionService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Список должностей организации',
    description: 'Возвращает все активные должности указанной организации, отсортированные по названию.',
  })
  @ApiQuery({ name: 'organizationId', type: String, description: 'ID организации' })
  @ApiResponse({ status: 200, description: 'Список должностей' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findAll(@Query('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.positionService.findAllByOrganization(organizationId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить должность по ID',
    description: 'Возвращает должность с её правами доступа.',
  })
  @ApiResponse({ status: 200, description: 'Данные должности' })
  @ApiResponse({ status: 404, description: 'Должность не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Обновить должность',
    description: 'Обновляет название и/или список прав. Поле permissions полностью заменяет текущий список.',
  })
  @ApiResponse({ status: 200, description: 'Должность обновлена' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации данных' })
  @ApiResponse({ status: 404, description: 'Должность не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatePositionSchema)) dto: UpdatePositionDto,
  ) {
    return this.positionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить должность',
    description: 'Мягкое удаление — должность скрывается, но остаётся в базе данных.',
  })
  @ApiResponse({ status: 200, description: 'Должность удалена' })
  @ApiResponse({ status: 404, description: 'Должность не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionService.remove(id);
  }
}
