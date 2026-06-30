import {
  makeCommentNodeId,
  makeEvaluationNodeId,
  makeProfessorNodeId,
  makeUserNodeId,
} from './graph.factory';
import { GraphRecommendationService } from './graph-recommendation.service';
import { ProjectGraph } from './project-graph';
import { ProjectGraphService } from './project-graph.service';

const addProfessor = (graph: ProjectGraph, id: number, nome: string): void => {
  graph.addTypedNode('professor', makeProfessorNodeId(id), nome, { id, nome });
};

const shareMatter = (graph: ProjectGraph, a: number, b: number): void => {
  graph.connect(
    makeProfessorNodeId(a),
    makeProfessorNodeId(b),
    'shares_matter',
    2,
    {
      bidirectional: true,
    },
  );
};

const shareDepartment = (graph: ProjectGraph, a: number, b: number): void => {
  graph.connect(
    makeProfessorNodeId(a),
    makeProfessorNodeId(b),
    'shares_department',
    1,
    {
      bidirectional: true,
    },
  );
};

/** Liga uma avaliação (com `commentCount` comentários) a um professor. */
const addEvaluation = (
  graph: ProjectGraph,
  evaluationId: number,
  professorId: number,
  commentCount: number,
): void => {
  const evaluationNodeId = makeEvaluationNodeId(evaluationId);
  graph.addTypedNode(
    'evaluation',
    evaluationNodeId,
    `Avaliação ${evaluationId}`,
    {
      id: evaluationId,
    },
  );
  graph.connect(
    evaluationNodeId,
    makeProfessorNodeId(professorId),
    'about_professor',
    5,
    {
      bidirectional: true,
    },
  );

  for (let i = 0; i < commentCount; i += 1) {
    const commentId = evaluationId * 100 + i;
    const commentNodeId = makeCommentNodeId(commentId);
    graph.addTypedNode('comment', commentNodeId, `Comentário ${commentId}`, {
      id: commentId,
    });
    graph.connect(commentNodeId, evaluationNodeId, 'commented_on', 3, {
      bidirectional: true,
    });
  }
};

/**
 * Liga um usuário a um professor por meio de uma avaliação que ele escreveu
 * (usuário -> avaliação -> professor), criando os nós que ainda não existem.
 */
const addUserEvaluation = (
  graph: ProjectGraph,
  userId: number,
  evaluationId: number,
  professorId: number,
): void => {
  const userNodeId = makeUserNodeId(userId);
  if (!graph.getNode(userNodeId)) {
    graph.addTypedNode('user', userNodeId, `Usuário ${userId}`, { id: userId });
  }

  const evaluationNodeId = makeEvaluationNodeId(evaluationId);
  if (!graph.getNode(evaluationNodeId)) {
    graph.addTypedNode(
      'evaluation',
      evaluationNodeId,
      `Avaliação ${evaluationId}`,
      { id: evaluationId },
    );
  }

  graph.connect(userNodeId, evaluationNodeId, 'authored', 3, {
    bidirectional: true,
  });
  graph.connect(
    evaluationNodeId,
    makeProfessorNodeId(professorId),
    'about_professor',
    5,
    { bidirectional: true },
  );
};

/**
 * Cenário base (origem é o professor 10):
 * - 11: 1 matéria + departamento em comum, 2 avaliações e 1 comentário
 * - 12: somente departamento em comum, sem engajamento
 * - 13: 2 matérias em comum, sem engajamento
 * - 14: sem nenhuma aresta de afinidade com a origem
 */
const buildScenario = (): ProjectGraph => {
  const graph = new ProjectGraph();

  [10, 11, 12, 13, 14].forEach((id) =>
    addProfessor(graph, id, `Professor ${id}`),
  );

  shareMatter(graph, 10, 11);
  shareDepartment(graph, 10, 11);

  shareDepartment(graph, 10, 12);

  shareMatter(graph, 10, 13);
  shareMatter(graph, 10, 13);

  addEvaluation(graph, 100, 11, 1);
  addEvaluation(graph, 101, 11, 0);

  return graph;
};

describe('GraphRecommendationService', () => {
  const service = new GraphRecommendationService({} as ProjectGraphService);

  describe('rankSimilarProfessors', () => {
    it('ranqueia por peso e detalha o porquê de cada recomendação', () => {
      const ranked = service.rankSimilarProfessors(buildScenario(), 10);

      // Pesos padrão: matéria=4, departamento=2, avaliação=1, comentário=0.5
      // 11 -> 4*1 + 2*1 + 1*2 + 0.5*1 = 8.5
      // 13 -> 4*2 + 0 + 0 + 0         = 8
      // 12 -> 0 + 2*1 + 0 + 0         = 2
      expect(ranked.map((item) => item.professorId)).toEqual([11, 13, 12]);

      const [first] = ranked;
      expect(first.professorId).toBe(11);
      expect(first.score).toBeCloseTo(8.5);
      expect(first.distance).toBe(1);
      expect(first.breakdown).toEqual({
        sharedMatters: 1,
        sharedDepartments: 1,
        evaluations: 2,
        comments: 1,
      });

      const segundo = ranked[1];
      expect(segundo.professorId).toBe(13);
      expect(segundo.breakdown.sharedMatters).toBe(2);
      expect(segundo.score).toBeCloseTo(8);
    });

    it('ignora a origem e professores sem afinidade', () => {
      const ranked = service.rankSimilarProfessors(buildScenario(), 10);
      const ids = ranked.map((item) => item.professorId);

      expect(ids).not.toContain(10);
      expect(ids).not.toContain(14);
    });

    it('retorna lista vazia para um professor inexistente', () => {
      expect(service.rankSimilarProfessors(buildScenario(), 999)).toEqual([]);
    });

    it('respeita o limite de recomendações', () => {
      const ranked = service.rankSimilarProfessors(buildScenario(), 10, {
        limit: 2,
      });

      expect(ranked.map((item) => item.professorId)).toEqual([11, 13]);
    });

    it('aplica pesos customizados', () => {
      // Considerando apenas matérias em comum, 13 (2 matérias) supera 11 (1).
      const ranked = service.rankSimilarProfessors(buildScenario(), 10, {
        weights: {
          sharedMatter: 1,
          sharedDepartment: 0,
          evaluation: 0,
          comment: 0,
        },
      });

      expect(ranked.map((item) => item.professorId)).toEqual([13, 11, 12]);
      expect(ranked[0].score).toBe(2);
    });

    it('alcança professores indiretos quando a profundidade aumenta', () => {
      const graph = buildScenario();
      // 15 compartilha matéria com 11, mas não diretamente com a origem (10).
      addProfessor(graph, 15, 'Professor 15');
      shareMatter(graph, 11, 15);

      const depth1 = service.rankSimilarProfessors(graph, 10, { maxDepth: 1 });
      expect(depth1.map((item) => item.professorId)).not.toContain(15);

      const depth2 = service.rankSimilarProfessors(graph, 10, { maxDepth: 2 });
      const indirect = depth2.find((item) => item.professorId === 15);
      expect(indirect).toBeDefined();
      expect(indirect?.distance).toBe(2);
      expect(indirect?.breakdown.sharedMatters).toBe(0);
    });
  });

  describe('rankRecommendationsForUser', () => {
    it('recomenda professores similares aos que o usuário avaliou', () => {
      const graph = buildScenario();
      // Usuário 1 avaliou apenas o professor 10.
      addUserEvaluation(graph, 1, 200, 10);

      const recomendacoes = service.rankRecommendationsForUser(graph, 1);

      // Mesmo ranking de similares ao professor 10, excluindo o próprio 10.
      expect(recomendacoes.map((item) => item.professorId)).toEqual([
        11, 13, 12,
      ]);

      const [primeiro] = recomendacoes;
      expect(primeiro.professorId).toBe(11);
      expect(primeiro.score).toBeCloseTo(8.5);
      expect(primeiro.baseadoEm).toEqual([
        { professorId: 10, nome: 'Professor 10' },
      ]);
    });

    it('exclui professores que o usuário já avaliou', () => {
      const graph = buildScenario();
      addUserEvaluation(graph, 1, 200, 10);
      addUserEvaluation(graph, 1, 201, 11);

      const recomendacoes = service.rankRecommendationsForUser(graph, 1);
      const ids = recomendacoes.map((item) => item.professorId);

      expect(ids).not.toContain(10);
      expect(ids).not.toContain(11);
    });

    it('soma as pontuações vindas de cada professor avaliado', () => {
      const graph = buildScenario();
      // Usuário 1 avaliou 11 e 13; ambos são similares ao professor 10.
      addUserEvaluation(graph, 1, 200, 11);
      addUserEvaluation(graph, 1, 201, 13);

      const recomendacoes = service.rankRecommendationsForUser(graph, 1);

      // 10 vem de 11 (score 6) e de 13 (score 8) -> 14, baseado em 2 professores.
      expect(recomendacoes.map((item) => item.professorId)).toEqual([10]);
      expect(recomendacoes[0].score).toBeCloseTo(14);
      expect(recomendacoes[0].baseadoEm).toHaveLength(2);
    });

    it('respeita o limite de recomendações', () => {
      const graph = buildScenario();
      addUserEvaluation(graph, 1, 200, 10);

      const recomendacoes = service.rankRecommendationsForUser(graph, 1, {
        limit: 2,
      });

      expect(recomendacoes.map((item) => item.professorId)).toEqual([11, 13]);
    });

    it('retorna lista vazia para usuário inexistente', () => {
      expect(service.rankRecommendationsForUser(buildScenario(), 999)).toEqual(
        [],
      );
    });

    it('retorna lista vazia quando o usuário não avaliou ninguém', () => {
      const graph = buildScenario();
      graph.addTypedNode('user', makeUserNodeId(1), 'Usuário 1', { id: 1 });

      expect(service.rankRecommendationsForUser(graph, 1)).toEqual([]);
    });
  });

  describe('recommendForUser', () => {
    it('monta o grafo base e recomenda a partir do histórico do usuário', async () => {
      const graph = buildScenario();
      addUserEvaluation(graph, 1, 200, 10);

      const buildBaseGraph = jest.fn().mockResolvedValue(graph);
      const projectGraphService = {
        buildBaseGraph,
      } as unknown as ProjectGraphService;

      const recommendation = new GraphRecommendationService(
        projectGraphService,
      );
      const recomendacoes = await recommendation.recommendForUser(1, {
        limit: 1,
      });

      expect(buildBaseGraph).toHaveBeenCalledTimes(1);
      expect(recomendacoes).toHaveLength(1);
      expect(recomendacoes[0].professorId).toBe(11);
    });
  });

  describe('recommendForProfessor', () => {
    it('monta o grafo base e ranqueia a partir dele', async () => {
      const buildBaseGraph = jest.fn().mockResolvedValue(buildScenario());
      const projectGraphService = {
        buildBaseGraph,
      } as unknown as ProjectGraphService;

      const recommendation = new GraphRecommendationService(
        projectGraphService,
      );
      const ranked = await recommendation.recommendForProfessor(10, {
        limit: 1,
      });

      expect(buildBaseGraph).toHaveBeenCalledTimes(1);
      expect(ranked).toHaveLength(1);
      expect(ranked[0].professorId).toBe(11);
    });
  });
});
