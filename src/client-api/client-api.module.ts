import { Module } from '@nestjs/common';
import { ClientApiOrganizationModule } from './organization/organization.module';
import { ClientApiEmployeeModule } from './employee/employee.module';

@Module({
  imports: [ClientApiOrganizationModule, ClientApiEmployeeModule],
})
export class ClientApiModule {}
