import { Injectable } from '@nestjs/common';
import { makeProfessorNodeId, makeUserNodeId } from './graph.factory';
import { ProjectGraph } from './project-graph';
import { ProjectGraphService } from './project-graph.service';
import {
  GraphRelationKind,
  ProfessorScoreBreakdown,
  RankedProfessor,
  RankingWeights,
  RecommendationOptions,
  UserProfessorRecommendation,
  UserRecommendationSource,
} from './project-graph.types';

/**
 * Pesos padrão do ranking. A ideia é refletir o quão forte cada dimensão
 * indica similaridade entre professores:
 * - compartilhar uma matéria é o sinal mais forte;
 * - compartilhar departamento é um sinal mais fraco e abrangente;
 * - avaliações e comentários medem o engajamento/relevância do candidato.
 */
export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  sharedMatter: 4,
  sharedDepartment: 2,
  evaluation: 1,
  comment: 0.5,
};

const PROFESSOR_AFFINITY_KINDS: GraphRelationKind[] = [
  'shares_matter',
  'shares_department',
];

/**
 * Gera recomendações de professores similares percorrendo o grafo do projeto.
 *
 * O fluxo é: BFS a partir do professor de origem pelas arestas de afinidade
 * (matéria/departamento) para descobrir candidatos e, em seguida, um ranking
 * ponderado por matéria, departamento, avaliações e comentários. Cada resultado
 * carrega um `breakdown`, tornando a recomendação justificável.
 */
@Injectable()
export class GraphRecommendationService {
  constructor(private readonly projectGraphService: ProjectGraphService) {}

  /**
   * Monta o grafo base a partir do banco e recomenda professores similares ao
   * professor informado.
   */
  async recommendForProfessor(
    professorId: number,
    options: RecommendationOptions = {},
  ): Promise<RankedProfessor[]> {
    const graph = await this.projectGraphService.buildBaseGraph();
    return this.rankSimilarProfessors(graph, professorId, options);
  }

  /**
   * Algoritmo de ranking puro: opera sobre um grafo já construído, o que o torna
   * determinístico e fácil de testar isoladamente.
   */
  rankSimilarProfessors(
    graph: ProjectGraph,
    professorId: number,
    options: RecommendationOptions = {},
  ): RankedProfessor[] {
    const sourceId = makeProfessorNodeId(professorId);

    if (!graph.getNode(sourceId)) {
      return [];
    }

    const weights: RankingWeights = {
      ...DEFAULT_RANKING_WEIGHTS,
      ...options.weights,
    };
    const maxDepth = options.maxDepth ?? 1;

    const candidates = graph.bfs(sourceId, {
      maxDepth,
      relationKinds: PROFESSOR_AFFINITY_KINDS,
    });

    const ranked = candidates
      .filter((visit) => visit.nodeId !== sourceId)
      .map((visit) =>
        this.scoreProfessor(
          graph,
          sourceId,
          visit.nodeId,
          visit.distance,
          weights,
        ),
      )
      .filter((candidate): candidate is RankedProfessor => candidate !== null)
      .sort(compareRankedProfessors);

    if (typeof options.limit === 'number') {
      return ranked.slice(0, Math.max(0, options.limit));
    }

    return ranked;
  }

  /**
   * Monta o grafo base e recomenda professores para um usuário a partir do
   * histórico de avaliações dele.
   */
  async recommendForUser(
    userId: number,
    options: RecommendationOptions = {},
  ): Promise<UserProfessorRecommendation[]> {
    const graph = await this.projectGraphService.buildBaseGraph();
    return this.rankRecommendationsForUser(graph, userId, options);
  }

  /**
   * Conecta os dados do usuário à rede de professores: descobre quais
   * professores o usuário já avaliou (usuário -> avaliação -> professor) e,
   * para cada um, reaproveita o ranking de professores similares. As
   * pontuações são somadas por professor candidato, de modo que quem é
   * parecido com vários professores avaliados sobe no ranking. Professores que
   * o usuário já avaliou são excluídos do resultado.
   */
  rankRecommendationsForUser(
    graph: ProjectGraph,
    userId: number,
    options: RecommendationOptions = {},
  ): UserProfessorRecommendation[] {
    const userNodeId = makeUserNodeId(userId);

    if (!graph.getNode(userNodeId)) {
      return [];
    }

    const evaluatedProfessors = this.findEvaluatedProfessors(graph, userNodeId);
    const evaluatedNodeIds = new Set(
      evaluatedProfessors.map((professor) => professor.nodeId),
    );

    const aggregated = new Map<number, UserProfessorRecommendation>();

    for (const source of evaluatedProfessors) {
      const similares = this.rankSimilarProfessors(graph, source.professorId, {
        maxDepth: options.maxDepth,
        weights: options.weights,
      });

      for (const similar of similares) {
        if (evaluatedNodeIds.has(similar.nodeId)) {
          continue;
        }

        const origem: UserRecommendationSource = {
          professorId: source.professorId,
          nome: source.nome,
        };

        const existing = aggregated.get(similar.professorId);

        if (existing) {
          existing.score += similar.score;
          existing.baseadoEm.push(origem);
        } else {
          aggregated.set(similar.professorId, {
            professorId: similar.professorId,
            nodeId: similar.nodeId,
            nome: similar.nome,
            score: similar.score,
            baseadoEm: [origem],
          });
        }
      }
    }

    const ranked = [...aggregated.values()].sort(compareUserRecommendations);

    if (typeof options.limit === 'number') {
      return ranked.slice(0, Math.max(0, options.limit));
    }

    return ranked;
  }

  /**
   * Percorre o histórico do usuário no grafo (arestas `authored` até as
   * avaliações e `about_professor` até os professores) e retorna, sem
   * repetições, os professores que ele já avaliou.
   */
  private findEvaluatedProfessors(
    graph: ProjectGraph,
    userNodeId: string,
  ): Array<{ professorId: number; nodeId: string; nome: string }> {
    const professors = new Map<
      string,
      { professorId: number; nodeId: string; nome: string }
    >();

    const evaluationEdges = graph
      .getOutgoingEdges(userNodeId)
      .filter((edge) => edge.kind === 'authored');

    for (const evaluationEdge of evaluationEdges) {
      const professorEdges = graph
        .getOutgoingEdges(evaluationEdge.to)
        .filter((edge) => edge.kind === 'about_professor');

      for (const professorEdge of professorEdges) {
        const node = graph.getNode(professorEdge.to);

        if (!node || node.kind !== 'professor') {
          continue;
        }

        const data = node.data as { id?: number };

        professors.set(professorEdge.to, {
          professorId: data.id ?? Number.NaN,
          nodeId: professorEdge.to,
          nome: node.label,
        });
      }
    }

    return [...professors.values()];
  }

  private scoreProfessor(
    graph: ProjectGraph,
    sourceId: string,
    candidateId: string,
    distance: number,
    weights: RankingWeights,
  ): RankedProfessor | null {
    const node = graph.getNode(candidateId);

    if (!node || node.kind !== 'professor') {
      return null;
    }

    const engagement = this.countEngagement(graph, candidateId);

    const breakdown: ProfessorScoreBreakdown = {
      sharedMatters: this.countDirectEdges(
        graph,
        sourceId,
        candidateId,
        'shares_matter',
      ),
      sharedDepartments: this.countDirectEdges(
        graph,
        sourceId,
        candidateId,
        'shares_department',
      ),
      evaluations: engagement.evaluations,
      comments: engagement.comments,
    };

    const score =
      weights.sharedMatter * breakdown.sharedMatters +
      weights.sharedDepartment * breakdown.sharedDepartments +
      weights.evaluation * breakdown.evaluations +
      weights.comment * breakdown.comments;

    const data = node.data as { id?: number };

    return {
      professorId: data.id ?? Number.NaN,
      nodeId: candidateId,
      nome: node.label,
      distance,
      score,
      breakdown,
    };
  }

  /** Conta arestas diretas de um tipo específico entre dois nós. */
  private countDirectEdges(
    graph: ProjectGraph,
    fromId: string,
    toId: string,
    kind: GraphRelationKind,
  ): number {
    return graph
      .getOutgoingEdges(fromId)
      .filter((edge) => edge.to === toId && edge.kind === kind).length;
  }

  /**
   * Conta avaliações e comentários ligados a um professor. As avaliações são
   * vizinhas diretas (aresta `about_professor`) e os comentários estão a uma
   * aresta de distância de cada avaliação (`commented_on`).
   */
  private countEngagement(
    graph: ProjectGraph,
    professorId: string,
  ): { evaluations: number; comments: number } {
    const evaluationEdges = graph
      .getOutgoingEdges(professorId)
      .filter((edge) => edge.kind === 'about_professor');

    let comments = 0;

    for (const edge of evaluationEdges) {
      comments += graph
        .getOutgoingEdges(edge.to)
        .filter((commentEdge) => commentEdge.kind === 'commented_on').length;
    }

    return { evaluations: evaluationEdges.length, comments };
  }
}

/**
 * Ordena do mais relevante para o menos relevante. Critérios de desempate
 * garantem uma saída estável: maior score, depois mais matérias em comum, depois
 * o professor mais próximo na BFS e, por fim, o menor id.
 */
export const compareRankedProfessors = (
  a: RankedProfessor,
  b: RankedProfessor,
): number => {
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  if (b.breakdown.sharedMatters !== a.breakdown.sharedMatters) {
    return b.breakdown.sharedMatters - a.breakdown.sharedMatters;
  }

  if (a.distance !== b.distance) {
    return a.distance - b.distance;
  }

  return a.professorId - b.professorId;
};

/**
 * Ordena recomendações de usuário: maior score primeiro, depois quem foi
 * sugerido por mais professores avaliados e, por fim, o menor id (estabilidade).
 */
export const compareUserRecommendations = (
  a: UserProfessorRecommendation,
  b: UserProfessorRecommendation,
): number => {
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  if (b.baseadoEm.length !== a.baseadoEm.length) {
    return b.baseadoEm.length - a.baseadoEm.length;
  }

  return a.professorId - b.professorId;
};
