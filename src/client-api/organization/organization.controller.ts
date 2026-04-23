import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientApiOrganizationService } from './organization.service';

@ApiTags('Client API / Organizations')
@Controller('client-api/organizations')
export class ClientApiOrganizationController {
  constructor(private organizationService: ClientApiOrganizationService) {}

  @Get()
  @ApiOperation({ summary: 'Список активных организаций' })
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Активная организация по ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.findOne(id);
  }
}
