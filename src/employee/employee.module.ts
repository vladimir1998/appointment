import { Module } from '@nestjs/common';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, OrgRequiredGuard, PermissionGuard],
  exports: [EmployeeService],
})
export class EmployeeModule {}
