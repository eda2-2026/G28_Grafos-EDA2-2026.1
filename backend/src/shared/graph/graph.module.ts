import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { GraphRecommendationService } from './graph-recommendation.service';
import { ProjectGraphService } from './project-graph.service';

@Module({
  imports: [PrismaModule],
  providers: [ProjectGraphService, GraphRecommendationService],
  exports: [ProjectGraphService, GraphRecommendationService],
})
export class GraphModule {}
