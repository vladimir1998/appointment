import { Module } from '@nestjs/common';
import { ClientApiOrganizationModule } from './organization/organization.module';

@Module({
  imports: [ClientApiOrganizationModule],
})
export class ClientApiModule {}
