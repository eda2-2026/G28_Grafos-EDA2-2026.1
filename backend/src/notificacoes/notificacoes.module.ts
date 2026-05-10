import { Module } from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';
import { NotificacoesController } from './notificacoes.controller';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  providers: [NotificacoesService, PrismaService],
  controllers: [NotificacoesController],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}
