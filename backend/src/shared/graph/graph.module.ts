import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { ProjectGraphService } from './project-graph.service';

@Module({
  imports: [PrismaModule],
  providers: [ProjectGraphService],
  exports: [ProjectGraphService],
})
export class GraphModule {}
