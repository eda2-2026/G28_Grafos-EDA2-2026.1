import { Body, Controller, Get, Patch, Delete, Param, Post, Query } from '@nestjs/common';
import { ComentarioDto } from './dto/comentarios.dto';
import { ComentariosService } from './comentarios.service';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller ('comentarios')

export class ComentariosController {

    constructor (private readonly comentariosService : ComentariosService){}
    @Post()
    async create(@Body() data: ComentarioDto){
        return this.comentariosService.create(data);
    }
    @IsPublic()
    @Get()
    async findAll(@Query('avaliacaoId') avaliacaoId?: string) {
        if (avaliacaoId) {
            return this.comentariosService.findAllByAvaliacaoId(+avaliacaoId);
        }
        return this.comentariosService.findAll();
    }
    @IsPublic()
    @Get('count/:avaliacaoId')
    async countPorAvaliacao(@Param('avaliacaoId') avaliacaoId: string) {
    const count = await this.comentariosService.countComentariosPorAvaliacao(Number(avaliacaoId));
    return { count };
    }

    @Patch(":id")
    async update(@Param("id") id: number, @Body() data: ComentarioDto) {
        return this.comentariosService.update(Number(id), data);

    }

    @Delete(":id")
    async delete(@Param("id") id:number){
        return this.comentariosService.delete(Number(id));
    }

    @Get(":id")
    async getById(@Param("id") id: number){
        return this.comentariosService.getById(Number(id));
    }

    
}
