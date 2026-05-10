import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { UsersDto } from 'src/users/dto/users.dto';
import { UserPayload } from './models/userPayload';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from './models/UserToken';


@Injectable()
export class AuthService {
    
    constructor(private readonly userService: UsersService, private readonly jwtService: JwtService) {}


    login(user: UsersDto): UserToken {
        const payload: UserPayload = {
            sub: user.id!,
            email: user.email,
            nome: user.nome,
        };
        const jwtToken = this.jwtService.sign(payload);
        
        return {
            access_token: jwtToken,
        }
    }


    async validateUser(email: string, senha: string){
        const user = await this.userService.findByEmail(email);
        
        if (user) {
            const senhaValida = await bcrypt.compare(senha, user.senha)
            if (senhaValida){
            return {
                ...user,
                senha: undefined,
            }
        };
        }
        throw new Error('email ou senha inválidas')
    }
}
