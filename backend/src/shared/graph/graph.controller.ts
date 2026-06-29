import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { IsPublic } from '../../auth/decorators/is-public.decorator';
import {
  ProfessorNetworkQueryDto,
  ProfessorRecommendationQueryDto,
} from './dto/graph-query.dto';
import { makeProfessorNodeId } from './graph.factory';
import { GraphRecommendationService } from './graph-recommendation.service';
import { ProjectGraphService } from './project-graph.service';

@IsPublic()
@Controller('graph')
export class GraphController {
  constructor(
    private readonly graphRecommendationService: GraphRecommendationService,
    private readonly projectGraphService: ProjectGraphService,
  ) {}

  @Get('professores/:id/recomendacoes')
  async getProfessorRecommendations(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ProfessorRecommendationQueryDto,
  ) {
    const recomendacoes =
      await this.graphRecommendationService.recommendForProfessor(id, {
        limit: query.limit ?? 6,
        maxDepth: query.maxDepth ?? 1,
      });

    return {
      professorId: id,
      total: recomendacoes.length,
      recomendacoes,
    };
  }

  @Get('professores/:id/rede')
  async getProfessorNetwork(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ProfessorNetworkQueryDto,
  ) {
    const graph = await this.projectGraphService.buildBaseGraph();
    const professorNodeId = makeProfessorNodeId(id);
    const professor = graph.getNode(professorNodeId);
    const recomendacoes =
      this.graphRecommendationService.rankSimilarProfessors(graph, id, {
        limit: query.limit ?? 6,
        maxDepth: query.maxDepth ?? 1,
      });

    return {
      professorId: id,
      professor: professor ?? null,
      conexoesDiretas: graph.getOutgoingEdges(professorNodeId),
      recomendacoes,
      grafo: query.incluirGrafoCompleto ? graph.toJSON() : undefined,
    };
  }
}
