import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';
import { EmployeeModule } from './employee/employee.module';
import { ClientModule } from './client/client.module';
import { ServiceModule } from './service/service.module';
import { PositionModule } from './position/position.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PermissionModule } from './permission/permission.module';
import { AuthContextMiddleware } from './common/middleware/auth-context.middleware';
import { ClientApiModule } from './client-api/client-api.module';

@Module({
  providers: [AuthContextMiddleware],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PermissionModule,
    UserModule,
    OrganizationModule,
    EmployeeModule,
    ClientModule,
    ServiceModule,
    PositionModule,
    AppointmentModule,
    ClientApiModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthContextMiddleware).forRoutes('*');
  }
}
