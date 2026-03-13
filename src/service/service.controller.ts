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
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { HasPermission } from '../common/decorators/has-permission.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ServiceService } from './service.service';
import { CreateServiceDto, createServiceSchema } from './dto/create-service.dto';
import { UpdateServiceDto, updateServiceSchema } from './dto/update-service.dto';

@ApiTags('Services')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', required: true })
@UseGuards(JwtAuthGuard, OrgRequiredGuard)
@Controller('services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermission('service:create')
  @ApiOperation({ summary: 'Create a new service' })
  @UsePipes(new ZodValidationPipe(createServiceSchema))
  create(@Body() dto: CreateServiceDto, @OrgId() organizationId: string) {
    return this.serviceService.create({ ...dto, organizationId });
  }

  @Get()
  @ApiOperation({ summary: 'Get services by organization' })
  findAll(
    @OrgId() organizationId: string,
    @HasPermission('service:read') includeInactive: boolean,
  ) {
    return this.serviceService.findAllByOrganization(organizationId, {
      includeInactive,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @OrgId() organizationId: string,
    @HasPermission('service:read') includeInactive: boolean,
  ) {
    return this.serviceService.findOne(id, {
      includeInactive,
      organizationId,
    });
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
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
  @UseGuards(PermissionGuard)
  @RequirePermission('service:delete')
  @ApiOperation({ summary: 'Delete service (soft delete)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @OrgId() organizationId: string,
  ) {
    return this.serviceService.remove(id, organizationId);
  }
}
