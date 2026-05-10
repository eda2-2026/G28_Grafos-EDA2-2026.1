import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { NotificacoesDto } from './dto/notificacoes.dto';
import { NotificacoesDtoUpdate } from './dto/update-notificacoes.dto';

@Injectable()
export class NotificacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: NotificacoesDto) {
    return this.prisma.notificacoes.create({
      data: {
        usersId: data.usersId,
        texto: data.texto,
        link: data.link,
        lida: data.lida ?? false,
        tipo: data.tipo,
      },
    });
  }

  async findAll() {
    return this.prisma.notificacoes.findMany({
      orderBy: {
        data: 'desc',
      },
    });
  }

  async findByUser(userId: number) {
  return this.prisma.notificacoes.findMany({
      where: { usersId: userId },
      orderBy: { data: 'desc' },
    });
  }

  async delete(id: number) {
    return this.prisma.notificacoes.delete({
      where: { id },
    });
  }

  async update(id: number, data: NotificacoesDtoUpdate) {
    return this.prisma.notificacoes.update({
      where: { id },
      data: {
        usersId: data.usersId,
        texto: data.texto,
        link: data.link,
        lida: data.lida,
        tipo: data.tipo,
        data: data.data,
      },
    });
  }

  async countNaoLidas(userId: number) {
  return this.prisma.notificacoes.count({
      where: {
        usersId: userId,
        lida: false,
      },
    });
  }

  async marcarTodasComoLidas(userId: number) {
    return this.prisma.notificacoes.updateMany({
      where: {
        usersId: userId,
        lida: false,
      },
      data: {
        lida: true,
      },
    });
  }
}

