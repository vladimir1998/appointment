import {
  BadRequestException,
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
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { AllowSkipOrgWhenGlobal } from '../common/decorators/allow-skip-org-when-global.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { EmployeeService } from './employee.service';
import {
  CreateEmployeeDto,
  createEmployeeSchema,
} from './dto/create-employee.dto';
import {
  UpdateEmployeeDto,
  updateEmployeeSchema,
} from './dto/update-employee.dto';
import {
  RegisterEmployeeDto,
  registerEmployeeSchema,
} from './dto/register-employee.dto';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Post('register')
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('employee:create')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({ summary: 'Register new user and add as employee to organization' })
  @ApiHeader({
    name: 'x-organization-id',
    required: false,
    description:
      'Обязателен для сотрудника организации. Пользователь с глобальным employee:create может без заголовка, указав organizationId в теле.',
  })
  register(
    @Body(new ZodValidationPipe(registerEmployeeSchema)) dto: RegisterEmployeeDto,
    @OrgId() organizationId?: string,
  ) {
    return this.employeeService.register({
      ...dto,
      organizationId: organizationId ?? dto.organizationId,
    });
  }

  @Post()
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('employee:create')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({
    summary: 'Add existing user as employee to organization',
    description:
      'Глобальный employee:create: без x-organization-id укажите organizationId в теле (любая организация). Сотрудник org: заголовок x-organization-id обязателен, права employee:create в этой организации.',
  })
  @ApiHeader({
    name: 'x-organization-id',
    required: false,
    description:
      'Для сотрудника организации обязателен. Иначе organizationId в теле (глобальный доступ).',
  })
  create(
    @Body(new ZodValidationPipe(createEmployeeSchema)) dto: CreateEmployeeDto,
    @OrgId() organizationId?: string,
  ) {
    const orgId = organizationId ?? dto.organizationId;
    if (!orgId) {
      throw new BadRequestException(
        'organizationId is required: pass it in the body or x-organization-id header',
      );
    }
    return this.employeeService.create({
      userId: dto.userId,
      positionId: dto.positionId,
      organizationId: orgId,
    });
  }

  @Get()
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('employee:read')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({
    summary: 'Список сотрудников',
    description:
      'Глобальный employee:read без заголовка — все сотрудники системы. С заголовком — только организации. Сотрудник org: заголовок обязателен.',
  })
  @ApiHeader({
    name: 'x-organization-id',
    required: false,
    description: 'Если не передан — только при глобальном employee:read (все организации).',
  })
  findAll(@OrgId() organizationId: string | undefined) {
    // Полный список: PermissionGuard уже проверил employee:read. Раньше @HasPermission
    // часто давал includeAll=false → фильтр isPublic=true при пустом isPublic в БД.
    if (organizationId) {
      return this.employeeService.findAllByOrganization(organizationId, {
        includeAll: true,
      });
    }
    return this.employeeService.findAllSystemWide({ includeAll: true });
  }

  @Get('user/:userId')
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('employee:read')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({
    summary: 'Профили сотрудника пользователя по организациям',
    description:
      'Без заголовка — все записи пользователя (глобальный employee:read). С x-organization-id — только в этой организации.',
  })
  @ApiHeader({ name: 'x-organization-id', required: false })
  findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @OrgId() organizationId: string | undefined,
  ) {
    return this.employeeService.findByUserId(userId, organizationId, {
      includeAll: true,
    });
  }

  @Get(':id')
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('employee:read')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({
    summary: 'Сотрудник по ID',
    description:
      'Без заголовка — любой сотрудник по id (глобальный employee:read). С заголовком — только если в этой организации.',
  })
  @ApiHeader({ name: 'x-organization-id', required: false })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @OrgId() organizationId: string | undefined,
  ) {
    return this.employeeService.findOne(id, organizationId, { includeAll: true });
  }

  @Patch(':id')
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('employee:update')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({
    summary: 'Обновить сотрудника',
    description:
      'Глобальный employee:update без заголовка — любой сотрудник по id. С x-organization-id — только в этой организации.',
  })
  @ApiHeader({ name: 'x-organization-id', required: false })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateEmployeeSchema)) dto: UpdateEmployeeDto,
    @OrgId() organizationId: string | undefined,
  ) {
    return this.employeeService.update(id, dto, organizationId);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('employee:delete')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({
    summary: 'Удалить сотрудника (soft delete)',
    description:
      'Глобальный employee:delete без заголовка — любой сотрудник по id. С x-organization-id — только в этой организации.',
  })
  @ApiHeader({ name: 'x-organization-id', required: false })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @OrgId() organizationId: string | undefined,
  ) {
    return this.employeeService.remove(id, organizationId);
  }
}
