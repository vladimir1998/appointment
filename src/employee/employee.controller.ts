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
  @UseGuards(OrgRequiredGuard, PermissionGuard)
  @RequirePermission('employee:create')
  @ApiOperation({ summary: 'Register new user and add as employee to organization' })
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UsePipes(new ZodValidationPipe(registerEmployeeSchema))
  register(@Body() dto: RegisterEmployeeDto, @OrgId() organizationId: string) {
    return this.employeeService.register({ ...dto, organizationId });
  }

  @Post()
  @UseGuards(OrgRequiredGuard, PermissionGuard)
  @RequirePermission('employee:create')
  @ApiOperation({ summary: 'Add existing user as employee to organization' })
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UsePipes(new ZodValidationPipe(createEmployeeSchema))
  create(@Body() dto: CreateEmployeeDto, @OrgId() organizationId: string) {
    return this.employeeService.create({ ...dto, organizationId });
  }

  @Get()
  @UseGuards(OrgRequiredGuard)
  @ApiOperation({ summary: 'Get employees by organization' })
  @ApiHeader({ name: 'x-organization-id', required: true })
  findAll(
    @OrgId() organizationId: string,
    @HasPermission('employee:read') includeAll: boolean,
  ) {
    return this.employeeService.findAllByOrganization(organizationId, {
      includeAll,
    });
  }

  @Get('user/:userId')
  @UseGuards(OrgRequiredGuard)
  @ApiOperation({ summary: 'Get all employee profiles of a user' })
  @ApiHeader({ name: 'x-organization-id', required: true })
  findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @OrgId() organizationId: string,
    @HasPermission('employee:read') includeAll: boolean,
  ) {
    return this.employeeService.findByUserId(userId, organizationId, {
      includeAll,
    });
  }

  @Get(':id')
  @UseGuards(OrgRequiredGuard)
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiHeader({ name: 'x-organization-id', required: true })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @OrgId() organizationId: string,
    @HasPermission('employee:read') includeAll: boolean,
  ) {
    return this.employeeService.findOne(id, organizationId, { includeAll });
  }

  @Patch(':id')
  @UseGuards(OrgRequiredGuard, PermissionGuard)
  @RequirePermission('employee:update')
  @ApiOperation({ summary: 'Update employee' })
  @ApiHeader({ name: 'x-organization-id', required: true })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateEmployeeSchema)) dto: UpdateEmployeeDto,
    @OrgId() organizationId: string,
  ) {
    return this.employeeService.update(id, dto, organizationId);
  }

  @Delete(':id')
  @UseGuards(OrgRequiredGuard, PermissionGuard)
  @RequirePermission('employee:delete')
  @ApiOperation({ summary: 'Remove employee (soft delete)' })
  @ApiHeader({ name: 'x-organization-id', required: true })
  remove(@Param('id', ParseUUIDPipe) id: string, @OrgId() organizationId: string) {
    return this.employeeService.remove(id, organizationId);
  }
}
