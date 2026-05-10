import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { MateriasDto } from './dto/materias.dto';
import { MateriasUpdateDto } from './dto/update-materias.dto';

@Injectable()
export class MateriasService {
    constructor(private prisma: PrismaService) {}
    async create(data: MateriasDto) {
    const professoresIds = Array.isArray(data.professoresIds) ? data.professoresIds : [];
    const materias = await this.prisma.materias.create({
        data: {
            nome: data.nome,
            prof: {
                connect: professoresIds.map(id => ({ id })),
            },
        },
        include: { prof: true },
    });

    return materias;
    }

        async findAll(){
        return await this.prisma.materias.findMany({
            include: {
                prof: true,
            },
        });
    }
    async delete(id: number){
        const materiasExists = await this.prisma.materias.findUnique({
            where: {
                id,
            },
        });

        if(!materiasExists){
            throw new Error('materia não existe');
        } 

        return await this.prisma.materias.delete({
            where: {
                id,
            },
        });
    }
    async update(id: number, updateData: MateriasUpdateDto){
            const materiaExists = await this.prisma.materias.findUnique({
                where: {
                    id,
                },
            });
    
            if(!materiaExists){
                throw new Error('Materia não existe');
            } 
            
            const dataToUpdateInPrisma: any = {};
            if (updateData.nome) {
            dataToUpdateInPrisma.nome = updateData.nome;
        }
            const profOperations: any = {};
        if (updateData.adicionarProfIds?.length! > 0) {
            profOperations.connect = updateData.adicionarProfIds!.map(profId => ({ id: profId }));
        }
        if (updateData.removerProfIds?.length! > 0) {
            profOperations.disconnect = updateData.removerProfIds!.map(profId => ({ id: profId }));
        }
            const updateMaterias = await this.prisma.materias.update({
            where: { id },
            data: dataToUpdateInPrisma
        });
        
        return updateMaterias;
    }
}

