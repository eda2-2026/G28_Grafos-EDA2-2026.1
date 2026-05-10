import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { ProfessoresDto } from './dto/professores.dto';
import { ProfessoresDtoUpdate } from './dto/update-professores.dto';

@Injectable()
export class ProfessoresService {
    constructor(private prisma: PrismaService) {}
    async create(data: ProfessoresDto) {
        const professor = await this.prisma.professores.create({
            data: data,
        });

        return professor;
    }
    
    async findAll(){
        return await this.prisma.professores.findMany({
            include:{avaliacoes: true, materias: true}
        });
    }

    async FindOne(id: number) {
        if(!id){
            throw new Error('Professor não encontrado')
        }
        return await this.prisma.professores.findUnique({
        where: {
        id,
    },
    include:{avaliacoes: true, materias: true},
    });
}

    async delete(id: number){
        const professorExists = await this.prisma.professores.findUnique({
            where: {
                id,
            },
        });

        if(!professorExists){
            throw new Error('Professor não existe');
        } 

        return await this.prisma.professores.delete({
            where: {
                id,
            },
        });
    }

    async update(id: number, updateData: ProfessoresDtoUpdate){
        const professorExists = await this.prisma.professores.findUnique({
            where: {
                id,
            },
        });

        if(!professorExists){
            throw new Error('Professor não existe');
        } 
        
        const dataToUpdateInPrisma: any = {};
        if (updateData.nome) {
        dataToUpdateInPrisma.nome = updateData.nome;
    }

        if (updateData.departamento) {
        dataToUpdateInPrisma.departamento = updateData.departamento;
    }
        if (updateData.fotosrc) {
        dataToUpdateInPrisma.fotosrc = updateData.fotosrc;
    }
        const updateProfessores = await this.prisma.professores.update({
        where: { id },
        data: dataToUpdateInPrisma
    });
    
    return updateProfessores;
}

}
