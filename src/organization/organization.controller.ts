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
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/auth-context.types';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { OrganizationReadScopeGuard } from './guards/organization-read-scope.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto,
  createOrganizationSchema,
} from './dto/create-organization.dto';
import {
  UpdateOrganizationDto,
  updateOrganizationSchema,
} from './dto/update-organization.dto';

@ApiTags('Organizations')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', required: false })
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermission('organization:create')
  @ApiOperation({ summary: 'Create a new organization' })
  @UsePipes(new ZodValidationPipe(createOrganizationSchema))
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationService.create(dto);
  }

  @Get()
  @UseGuards(OrganizationReadScopeGuard)
  @ApiOperation({
    summary: 'Список организаций',
    description:
      'С глобальным organization:read — все организации. Иначе только организации, где у пользователя сотрудник с правом organization:read в должности.',
  })
  findAll(@CurrentUser() user: RequestUser) {
    return this.organizationService.findAllForCaller(user);
  }

  @Get(':id')
  @UseGuards(OrganizationReadScopeGuard)
  @ApiOperation({
    summary: 'Организация по ID',
    description:
      'С глобальным organization:read — любая. Иначе только если пользователь имеет organization:read в этой организации (через должность).',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.organizationService.findOneForCaller(user, id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('organization:update')
  @ApiOperation({ summary: 'Update organization' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateOrganizationSchema)) dto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('organization:delete')
  @ApiOperation({ summary: 'Delete organization (soft delete)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.remove(id);
  }
}
