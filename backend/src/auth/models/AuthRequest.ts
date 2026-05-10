import { Request } from "express";
import { UsersDto } from "src/users/dto/users.dto";
export interface AuthRequest extends Request {
    user: UsersDto;
}