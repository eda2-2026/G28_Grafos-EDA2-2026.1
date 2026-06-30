export type GraphNodeKind =
  | 'user'
  | 'professor'
  | 'evaluation'
  | 'comment'
  | 'matter'
  | 'department';

export type GraphRelationKind =
  | 'authored'
  | 'about_professor'
  | 'references_matter'
  | 'written_by'
  | 'commented_on'
  | 'teaches'
  | 'belongs_to_department'
  | 'shares_matter'
  | 'shares_department';

export interface GraphNode<TData = Record<string, unknown>> {
  id: string;
  kind: GraphNodeKind;
  label: string;
  data: TData;
}

export interface GraphEdge<TData = Record<string, unknown>> {
  from: string;
  to: string;
  kind: GraphRelationKind;
  weight: number;
  bidirectional: boolean;
  data: TData;
}

export interface GraphSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface BfsOptions {
  /** Distância máxima (em arestas) a ser explorada a partir da origem. */
  maxDepth?: number;
  /** Se informado, somente arestas desses tipos são percorridas. */
  relationKinds?: GraphRelationKind[];
}

export interface BfsVisit {
  nodeId: string;
  /** Número de arestas percorridas da origem até este nó. */
  distance: number;
}

export interface RankingWeights {
  sharedMatter: number;
  sharedDepartment: number;
  evaluation: number;
  comment: number;
}

export interface RecommendationOptions {
  /** Profundidade da BFS de professores. Padrão: 1 (apenas vizinhos diretos). */
  maxDepth?: number;
  /** Quantidade máxima de recomendações retornadas. */
  limit?: number;
  /** Sobrescreve os pesos padrão usados no ranking. */
  weights?: Partial<RankingWeights>;
}

export interface ProfessorScoreBreakdown {
  sharedMatters: number;
  sharedDepartments: number;
  evaluations: number;
  comments: number;
}

export interface RankedProfessor {
  professorId: number;
  nodeId: string;
  nome: string;
  distance: number;
  score: number;
  breakdown: ProfessorScoreBreakdown;
}

/** Professor já avaliado pelo usuário que motivou uma recomendação. */
export interface UserRecommendationSource {
  professorId: number;
  nome: string;
}

/**
 * Recomendação de professor para um usuário. O `score` é a soma das pontuações
 * de similaridade vindas de cada professor que o usuário já avaliou, e
 * `baseadoEm` lista esses professores para tornar a sugestão justificável.
 */
export interface UserProfessorRecommendation {
  professorId: number;
  nodeId: string;
  nome: string;
  score: number;
  baseadoEm: UserRecommendationSource[];
}
