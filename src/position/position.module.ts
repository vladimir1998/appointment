import { Module } from '@nestjs/common';
import { PermissionGuard } from '../common/guards/permission.guard';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';

@Module({
  controllers: [PositionController],
  providers: [PositionService, PermissionGuard],
  exports: [PositionService],
})
export class PositionModule {}
