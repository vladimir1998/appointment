import { Module } from '@nestjs/common';
import { ClientApiEmployeeController } from './employee.controller';
import { ClientApiEmployeeService } from './employee.service';

@Module({
  controllers: [ClientApiEmployeeController],
  providers: [ClientApiEmployeeService],
})
export class ClientApiEmployeeModule {}
