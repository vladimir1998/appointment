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
import { RequirePermission } from '../common/decorators/require-permission.decorator';
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
  @UseGuards(PermissionGuard)
  @RequirePermission('organization:read')
  @ApiOperation({ summary: 'Get all organizations' })
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('organization:read')
  @ApiOperation({ summary: 'Get organization by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.findOne(id);
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
