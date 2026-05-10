import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';
import { AvaliacoesDto } from './dto/avaliacoes.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { AvaliacoesDtoUpdate } from './dto/update-avaliacoes.dto';

@Controller('avaliacoes')
export class AvaliacoesController {
    constructor(private readonly avaliacoesService: AvaliacoesService) {}
    @Post()
    async create(@Body() data: AvaliacoesDto) {
        return this.avaliacoesService.create(data)
    }
    @IsPublic()
    @Get()
    async findAll(){
        return this.avaliacoesService.findAll();
    }
    
    @IsPublic()
      @Get(':id')
      async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.avaliacoesService.FindOne(Number(id));
      }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number){
        return this.avaliacoesService.delete(id);
    }
    
    @Patch(':id')
    async update (@Param('id', ParseIntPipe) id: number, @Body() updateData: AvaliacoesDtoUpdate) {
        return this.avaliacoesService.update(id, updateData)
    }
}