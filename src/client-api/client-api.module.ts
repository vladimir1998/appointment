import { Module } from '@nestjs/common';
import { ClientApiOrganizationModule } from './organization/organization.module';
import { ClientApiEmployeeModule } from './employee/employee.module';
import { ClientApiServiceModule } from './service/service.module';
import { ClientApiAppointmentModule } from './appointment/appointment.module';

@Module({
  imports: [ClientApiOrganizationModule, ClientApiEmployeeModule, ClientApiServiceModule, ClientApiAppointmentModule],
})
export class ClientApiModule {}
