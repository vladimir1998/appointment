import { Module } from '@nestjs/common';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';

@Module({
  controllers: [ServiceController],
  providers: [ServiceService, OrgRequiredGuard, PermissionGuard],
  exports: [ServiceService],
})
export class ServiceModule {}
