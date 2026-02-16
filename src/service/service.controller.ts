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
import { ServiceService } from './service.service';
import { CreateServiceDto, createServiceSchema } from './dto/create-service.dto';
import { UpdateServiceDto, updateServiceSchema } from './dto/update-service.dto';

@ApiTags('Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @UsePipes(new ZodValidationPipe(createServiceSchema))
  create(@Body() dto: CreateServiceDto) {
    return this.serviceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get services by organization' })
  @ApiQuery({ name: 'organizationId', type: String })
  findAll(@Query('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.serviceService.findAllByOrganization(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateServiceSchema)) dto: UpdateServiceDto,
  ) {
    return this.serviceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service (soft delete)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceService.remove(id);
  }
}
