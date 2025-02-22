import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '@modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from '../../constants/jwtConstants';
import { UsersService } from '@modules/users/users.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    AuthService,
    UsersService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
