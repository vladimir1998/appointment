import { Module } from '@nestjs/common';
import { ClientApiAppointmentController } from './appointment.controller';
import { ClientApiAppointmentService } from './appointment.service';

@Module({
  controllers: [ClientApiAppointmentController],
  providers: [ClientApiAppointmentService],
})
export class ClientApiAppointmentModule {}
