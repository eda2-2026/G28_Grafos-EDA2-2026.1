import { GraphController } from './graph.controller';
import { GraphRecommendationService } from './graph-recommendation.service';
import { ProjectGraph } from './project-graph';
import { ProjectGraphService } from './project-graph.service';

describe('GraphController', () => {
  let controller: GraphController;
  let recommendationService: jest.Mocked<GraphRecommendationService>;
  let projectGraphService: jest.Mocked<ProjectGraphService>;

  beforeEach(() => {
    recommendationService = {
      recommendForProfessor: jest.fn(),
      rankSimilarProfessors: jest.fn(),
    } as unknown as jest.Mocked<GraphRecommendationService>;

    projectGraphService = {
      buildBaseGraph: jest.fn(),
    } as unknown as jest.Mocked<ProjectGraphService>;

    controller = new GraphController(recommendationService, projectGraphService);
  });

  it('retorna recomendações de professores com limite padrão', async () => {
    const recomendacoes = [
      {
        professorId: 2,
        nodeId: 'professor:2',
        nome: 'Professora Ada',
        distance: 1,
        score: 6,
        breakdown: {
          sharedMatters: 1,
          sharedDepartments: 1,
          evaluations: 0,
          comments: 0,
        },
      },
    ];

    recommendationService.recommendForProfessor.mockResolvedValue(recomendacoes);

    await expect(controller.getProfessorRecommendations(1, {})).resolves.toEqual({
      professorId: 1,
      total: 1,
      recomendacoes,
    });
    expect(recommendationService.recommendForProfessor).toHaveBeenCalledWith(1, {
      limit: 6,
      maxDepth: 1,
    });
  });

  it('retorna a rede direta do professor com recomendações ranqueadas', async () => {
    const graph = new ProjectGraph();
    graph.addTypedNode('professor', 'professor:1', 'Professor Alan', { id: 1 });
    graph.addTypedNode('professor', 'professor:2', 'Professora Ada', { id: 2 });
    graph.connect('professor:1', 'professor:2', 'shares_matter', 2, {
      bidirectional: true,
    });

    const recomendacoes = [
      {
        professorId: 2,
        nodeId: 'professor:2',
        nome: 'Professora Ada',
        distance: 1,
        score: 4,
        breakdown: {
          sharedMatters: 1,
          sharedDepartments: 0,
          evaluations: 0,
          comments: 0,
        },
      },
    ];

    projectGraphService.buildBaseGraph.mockResolvedValue(graph);
    recommendationService.rankSimilarProfessors.mockReturnValue(recomendacoes);

    const response = await controller.getProfessorNetwork(1, {
      limit: 3,
      maxDepth: 2,
    });

    expect(response).toMatchObject({
      professorId: 1,
      professor: {
        id: 'professor:1',
        kind: 'professor',
        label: 'Professor Alan',
      },
      recomendacoes,
    });
    expect(response.conexoesDiretas).toHaveLength(1);
    expect(response.grafo).toBeUndefined();
    expect(recommendationService.rankSimilarProfessors).toHaveBeenCalledWith(
      graph,
      1,
      {
        limit: 3,
        maxDepth: 2,
      },
    );
  });
});
