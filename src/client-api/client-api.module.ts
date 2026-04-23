import { Module } from '@nestjs/common';
import { ClientApiOrganizationModule } from './organization/organization.module';
import { ClientApiEmployeeModule } from './employee/employee.module';
import { ClientApiServiceModule } from './service/service.module';

@Module({
  imports: [ClientApiOrganizationModule, ClientApiEmployeeModule, ClientApiServiceModule],
})
export class ClientApiModule {}
