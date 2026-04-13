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
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { AllowSkipOrgWhenGlobal } from '../common/decorators/allow-skip-org-when-global.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ServiceService } from './service.service';
import { CreateServiceDto, createServiceSchema } from './dto/create-service.dto';
import { UpdateServiceDto, updateServiceSchema } from './dto/update-service.dto';

@ApiTags('Services')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', required: false })
@UseGuards(JwtAuthGuard, PermissionGuard, OrgRequiredGuard)
@Controller('services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Post()
  @RequirePermission('service:create')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({ summary: 'Create a new service' })
  create(@Body(new ZodValidationPipe(createServiceSchema)) dto: CreateServiceDto, @OrgId() organizationId?: string) {
    return this.serviceService.create({
      ...dto,
      organizationId: organizationId ?? dto.organizationId,
    });
  }

  @Get()
  @RequirePermission('service:read')
  @ApiOperation({ summary: 'Get services by organization' })
  findAll(@OrgId() organizationId: string) {
    return this.serviceService.findAllByOrganization(organizationId);
  }

  @Get(':id')
  @RequirePermission('service:read')
  @ApiOperation({ summary: 'Get service by ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @OrgId() organizationId: string,
  ) {
    return this.serviceService.findOne(id, { organizationId });
  }

  @Patch(':id')
  @RequirePermission('service:update')
  @ApiOperation({ summary: 'Update service' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateServiceSchema)) dto: UpdateServiceDto,
    @OrgId() organizationId: string,
  ) {
    return this.serviceService.update(id, dto, organizationId);
  }

  @Delete(':id')
  @RequirePermission('service:delete')
  @ApiOperation({ summary: 'Delete service (soft delete)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @OrgId() organizationId: string,
  ) {
    return this.serviceService.remove(id, organizationId);
  }
}
