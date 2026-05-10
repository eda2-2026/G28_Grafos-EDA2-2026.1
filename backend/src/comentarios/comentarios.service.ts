import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ComentarioDto } from './dto/comentarios.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Injectable()
export class ComentariosService {

    constructor(private prisma: PrismaService){}

    async create (data: ComentarioDto) {
        const comentarios = await this.prisma.comentarios.create({
            data
        });

        return comentarios;
    }
    async findAll(){
        return await this.prisma.comentarios.findMany();
    }

    async update(id: number, data: ComentarioDto){
        const comentariosExists = await this.prisma.comentarios.findUnique({
            where:{
                id,
            }
        });

        if(!comentariosExists){
            throw new Error('Comentário não encontrado')
        }

        return await this.prisma.comentarios.update({
            data,
            where: {
                id,
            }
        });
    }

    async delete(id:number){
        const comentariosExists = await this.prisma.comentarios.findUnique({
            where:{
                id,
            }
        });

        if(!comentariosExists){
            throw new Error('Comentário não encontrado')
        }

        return await this.prisma.comentarios.delete({
            where: {
                id,
            }
        });
    }

    async getById(id: number){
        const comentariosExists = await this.prisma.comentarios.findUnique({
            where:{
                id,
            }
        });

        if(!comentariosExists){
            throw new Error('Comentário não encontrado')
        }

        return comentariosExists;

    }

    async countComentariosPorAvaliacao(avaliacaoId: number): Promise<number> {
        return await this.prisma.comentarios.count({
        where: { avaliacaoId }
        });
    }

    async findAllByAvaliacaoId(idDaAvaliacao: number) {
        return this.prisma.comentarios.findMany({
            where: {
                avaliacaoId: idDaAvaliacao,
            }
        });
    }
}