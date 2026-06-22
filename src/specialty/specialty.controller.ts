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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { AllowSkipOrgWhenGlobal } from '../common/decorators/allow-skip-org-when-global.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { SpecialtyService } from './specialty.service';
import { CreateSpecialtyDto, createSpecialtySchema } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto, updateSpecialtySchema } from './dto/update-specialty.dto';

@ApiTags('Specialties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('specialties')
export class SpecialtyController {
  constructor(private specialtyService: SpecialtyService) {}

  @Post()
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('specialty:create')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({ summary: 'Создать специальность' })
  @ApiHeader({
    name: 'x-organization-id',
    required: false,
    description:
      'Обязателен для сотрудника организации. Пользователь с глобальным specialty:create может без заголовка, указав organizationId в теле.',
  })
  @ApiResponse({ status: 201, description: 'Специальность успешно создана' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации данных' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  create(@Body(new ZodValidationPipe(createSpecialtySchema)) dto: CreateSpecialtyDto, @OrgId() organizationId?: string) {
    return this.specialtyService.create({
      ...dto,
      organizationId: organizationId ?? dto.organizationId,
    });
  }

  @Get()
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('specialty:read')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({
    summary: 'Список специальностей',
    description:
      'Глобальный specialty:read без заголовка — все специальности системы. С заголовком — только организации.',
  })
  @ApiHeader({
    name: 'x-organization-id',
    required: false,
    description: 'Если не передан — только при глобальном specialty:read.',
  })
  findAll(@OrgId() organizationId: string | undefined) {
    if (organizationId) {
      return this.specialtyService.findAllByOrganization(organizationId);
    }
    return this.specialtyService.findAllSystemWide();
  }

  @Get(':id')
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('specialty:read')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({ summary: 'Получить специальность по ID' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  @ApiResponse({ status: 200, description: 'Данные специальности' })
  @ApiResponse({ status: 404, description: 'Специальность не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @OrgId() organizationId: string | undefined,
  ) {
    return this.specialtyService.findOne(id, organizationId);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('specialty:update')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({ summary: 'Обновить специальность' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  @ApiResponse({ status: 200, description: 'Специальность обновлена' })
  @ApiResponse({ status: 404, description: 'Специальность не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateSpecialtySchema)) dto: UpdateSpecialtyDto,
    @OrgId() organizationId: string | undefined,
  ) {
    return this.specialtyService.update(id, dto, organizationId);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('specialty:delete')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({ summary: 'Удалить специальность (soft delete)' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  @ApiResponse({ status: 200, description: 'Специальность удалена' })
  @ApiResponse({ status: 404, description: 'Специальность не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @OrgId() organizationId: string | undefined,
  ) {
    return this.specialtyService.remove(id, organizationId);
  }
}
