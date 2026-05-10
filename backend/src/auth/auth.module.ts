import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './estrategies/local.strategy';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './estrategies/jwt.strategy';

@Module({
  imports: [UsersModule, PassportModule, JwtModule, JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: {  expiresIn: '1h'}
  })],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
