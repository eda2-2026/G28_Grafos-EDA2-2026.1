import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../models/AuthRequest';
import { UsersDto } from 'src/users/dto/users.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UsersDto => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    return request.user;
  },
);