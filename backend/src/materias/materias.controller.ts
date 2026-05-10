import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MateriasService } from './materias.service';
import { MateriasDto } from './dto/materias.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { MateriasUpdateDto } from './dto/update-materias.dto';

@Controller('materias')
export class MateriasController {
    constructor(private readonly materiasService: MateriasService) {}
        @Post()
        async create(@Body() data: MateriasDto) {
            return this.materiasService.create(data);
        }
        @IsPublic()
        @Get()
        async findAll(){
            return this.materiasService.findAll();
            }
        @Delete(':id')
        async delete(@Param('id', ParseIntPipe) id: number){
            return this.materiasService.delete(id);
            }    
        @Patch(':id')
        async update(@Param('id', ParseIntPipe) id: number, @Body() updateData: MateriasUpdateDto){
        return this.materiasService.update(id, updateData);
      }

}

