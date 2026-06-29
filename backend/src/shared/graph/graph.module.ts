import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { GraphController } from './graph.controller';
import { GraphRecommendationService } from './graph-recommendation.service';
import { ProjectGraphService } from './project-graph.service';

@Module({
  imports: [PrismaModule],
  controllers: [GraphController],
  providers: [ProjectGraphService, GraphRecommendationService],
  exports: [ProjectGraphService, GraphRecommendationService],
})
export class GraphModule {}
