import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controller/auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { ValidateUserUseCase } from './use-cases/validate-user.usecase';
import { UsersModule } from '../users/users.module';
import { LogoutUseCase } from './use-cases/logout.usecase';
import { RedisModule } from 'src/infra/redis/redis.module';
import { LoginUseCase } from './use-cases/login.usecase';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secretKey',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '24h') as any,
          issuer: configService.get<string>('JWT_ISSUER') || 'nearby-api',
          audience: configService.get<string>('JWT_AUDIENCE') || 'nearby-api-users',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LocalStrategy,
    ValidateUserUseCase,
    LoginUseCase,
    LogoutUseCase
  ],
  exports: [JwtModule],
})
export class AuthModule { }