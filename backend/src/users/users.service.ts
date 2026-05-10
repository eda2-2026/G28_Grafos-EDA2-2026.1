import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UsersDto } from './dto/users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}
    
    async create(data: UsersDto) {
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(data.senha, saltRounds);
        const user = await this.prisma.users.create({
            data:{ 
                ...data,
                senha: senhaHash
            },
        });
        const {senha, ...result} = user;
        return result;
    }

    async FindAll() {
        return await this.prisma.users.findMany();
    }

    async FindOne(id: number) {
        if(!id){
            throw new Error('Usuario não encontrado');
        }
        return await this.prisma.users.findUnique({
            where: { id },
        });
    }

    async update(id: number, updateData: UpdateUserDto) {
        const userExists = await this.prisma.users.findUnique({
            where: { id },
        });

        if (!userExists) {
            throw new Error('Usuario não encontrado');
        }

        const { senha, ...dataToUpdate } = updateData;

        if (Object.keys(dataToUpdate).length === 0) {
            return userExists; 
        }

        const updatedUser = await this.prisma.users.update({
            where: { id },
            data: dataToUpdate,
        });
        const {senha: removedPassword, ...result} = updatedUser;
        return result;
    }

    async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
        const user = await this.prisma.users.findUnique({
            where: { id },
        });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const isPasswordValid = await bcrypt.compare(
            changePasswordDto.senhaAntiga,
            user.senha,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Senha antiga incorreta.');
        }

        const saltRounds = 10;
        const novaSenhaHash = await bcrypt.hash(changePasswordDto.novaSenha, saltRounds);

        await this.prisma.users.update({
            where: { id },
            data: { senha: novaSenhaHash },
        });

        return { message: 'Senha alterada com sucesso.' };
    }

    async delete(id: number) {
        const userExists = await this.prisma.users.findUnique({
            where: { id },
        });
        if (!userExists) {
            throw new Error('Usuário nao existe');
        }
        return await this.prisma.users.delete({
            where: { id },
        });
    }
    
    async findByEmail(email: string) {
        return this.prisma.users.findUnique({
            where: {email},
        });
    }
}