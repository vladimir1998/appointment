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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Add employee to organization' })
  @UsePipes(new ZodValidationPipe(createEmployeeSchema))
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get employees by organization' })
  @ApiQuery({ name: 'organizationId', type: String })
  findAll(@Query('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.employeeService.findAllByOrganization(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all employee profiles of a user' })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.employeeService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateEmployeeSchema)) dto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove employee (soft delete)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.remove(id);
  }
}
