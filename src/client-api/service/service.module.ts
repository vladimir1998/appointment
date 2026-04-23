import { Module } from '@nestjs/common';
import { ClientApiServiceController } from './service.controller';
import { ClientApiServiceService } from './service.service';

@Module({
  controllers: [ClientApiServiceController],
  providers: [ClientApiServiceService],
})
export class ClientApiServiceModule {}
