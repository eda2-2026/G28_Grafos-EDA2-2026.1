import { Module } from '@nestjs/common';
import { ProfessoresService } from './professores.service';
import { ProfessoresController } from './professores.controller';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  providers: [ProfessoresService, PrismaService],
  controllers: [ProfessoresController],
  exports: [ProfessoresService]
})
export class ProfessoresModule {}
