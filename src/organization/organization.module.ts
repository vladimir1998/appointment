import { Module } from '@nestjs/common';
import { PermissionGuard } from '../common/guards/permission.guard';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, PermissionGuard],
  exports: [OrganizationService],
})
export class OrganizationModule {}
