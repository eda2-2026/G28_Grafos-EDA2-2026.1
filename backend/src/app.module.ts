import { Module } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/users.controller';
import { ProfessoresController } from './professores/professores.controller';
import { ProfessoresModule } from './professores/professores.module';
import { PrismaModule } from './database/prisma.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ProfessoresService } from './professores/professores.service';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AvaliacoesController } from './avaliacoes/avaliacoes.controller';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { AvaliacoesService } from './avaliacoes/avaliacoes.service';
import { MateriasModule } from './materias/materias.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { ComentariosModule } from './comentarios/comentarios.module';

// --- ADIÇÕES NECESSÁRIAS ---
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// -------------------------

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads/',
    }),
    UsersModule,
    ProfessoresModule,
    ComentariosModule,
    PrismaModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    AvaliacoesModule,
    MateriasModule,
    NotificacoesModule,
  ],
  controllers: [
    UsersController,
    ProfessoresController,
    AuthController,
    AvaliacoesController,
  ],
  providers: [
    UsersService,
    AuthService,
    ProfessoresService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AvaliacoesService,
  ],
})
export class AppModule {}