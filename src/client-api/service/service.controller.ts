import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClientApiServiceService } from './service.service';

@ApiTags('Client API / Services')
@Controller('client-api/organizations/:organizationId/services')
export class ClientApiServiceController {
  constructor(private serviceService: ClientApiServiceService) {}

  @Get()
  @ApiOperation({ summary: 'Активные услуги организации' })
  @ApiQuery({ name: 'employeeId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'include', required: false, type: [String], isArray: true })
  findAll(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Query('employeeId') employeeId?: string,
    @Query('include') include?: string | string[],
  ) {
    const includeArray = include ? (Array.isArray(include) ? include : [include]) : [];
    return this.serviceService.findAll(organizationId, employeeId, includeArray);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Услуга организации по ID' })
  findOne(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.serviceService.findOne(organizationId, id);
  }
}
