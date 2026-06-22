import { Module } from '@nestjs/common';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { SpecialtyService } from './specialty.service';
import { SpecialtyController } from './specialty.controller';

@Module({
  controllers: [SpecialtyController],
  providers: [SpecialtyService, PermissionGuard, OrgRequiredGuard],
  exports: [SpecialtyService],
})
export class SpecialtyModule {}
