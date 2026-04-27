import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClientApiEmployeeService } from './employee.service';

@ApiTags('Client API / Employees')
@Controller('client-api/organizations/:organizationId/employees')
export class ClientApiEmployeeController {
  constructor(private employeeService: ClientApiEmployeeService) {}

  @Get()
  @ApiOperation({ summary: 'Публичные сотрудники организации' })
  @ApiQuery({ name: 'serviceId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'include', required: false, type: [String], isArray: true })
  findAll(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Query('serviceId') serviceId?: string,
    @Query('include') include?: string | string[],
  ) {
    const includeArray = include ? (Array.isArray(include) ? include : [include]) : [];
    return this.employeeService.findAll(organizationId, serviceId, includeArray);
  }
}
