import { Module } from '@nestjs/common';
import { ClientApiOrganizationController } from './organization.controller';
import { ClientApiOrganizationService } from './organization.service';

@Module({
  controllers: [ClientApiOrganizationController],
  providers: [ClientApiOrganizationService],
})
export class ClientApiOrganizationModule {}
