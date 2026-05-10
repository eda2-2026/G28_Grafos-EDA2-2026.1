import { Module } from '@nestjs/common';
import { MateriasService } from './materias.service';
import { MateriasController } from './materias.controller';

@Module({
  providers: [MateriasService],
  controllers: [MateriasController]
})
export class MateriasModule {}
