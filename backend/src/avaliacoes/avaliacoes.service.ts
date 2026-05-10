import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AvaliacoesDto } from './dto/avaliacoes.dto';
import { AvaliacoesDtoUpdate } from './dto/update-avaliacoes.dto';
import { format } from 'date-fns'; 

@Injectable()
export class AvaliacoesService {
    constructor(private prisma: PrismaService) {}
    async create(data: AvaliacoesDto){
        const avaliacao = await this.prisma.avaliacoes.create({
            data: data
        });
        return avaliacao;
    }
    
    async findAll(){
        return await this.prisma.avaliacoes.findMany();
    }

    async delete(id: number){
        const avaliacaoExists = await this.prisma.avaliacoes.findUnique({
            where: {
                id,
            },
        });

        if(!avaliacaoExists){
            throw new Error('avaliação não existe');
        }

        return await this.prisma.avaliacoes.delete({
            where: {
                id,
            },
        });
    }

    async update(id: number, updateData: AvaliacoesDtoUpdate){
        const avaliacaoExists = await this.prisma.avaliacoes.findUnique({
            where: {
                id,
            },
        });

        if(!avaliacaoExists){
            throw new Error('avaliação não existe');
        }

        const dataToUpdateInPrisma: any = {};   
        if(!avaliacaoExists){
            throw new Error('avaliação não existe');
        }
        if (updateData.avaliacao) {
    dataToUpdateInPrisma.avaliacao = updateData.avaliacao;
    }

    const updateAvaliacoes = await this.prisma.avaliacoes.update({
        where: { id },
        data: dataToUpdateInPrisma
    });
    
    return updateAvaliacoes;
    }

    async FindOne(id: number) {
        if(!id){
            throw new Error('Avaliação não encontrado')
        }
        return await this.prisma.avaliacoes.findUnique({
        where: {
        id,
    }});
}
}
