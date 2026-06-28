import { GraphNode } from './project-graph.types';

export const normalizeKey = (value: string): string =>
  value.trim().toLowerCase();

export const makeProfessorNodeId = (id: number): string => `professor:${id}`;
export const makeUserNodeId = (id: number): string => `user:${id}`;
export const makeEvaluationNodeId = (id: number): string => `evaluation:${id}`;
export const makeCommentNodeId = (id: number): string => `comment:${id}`;
export const makeMatterNodeId = (name: string): string => `matter:${normalizeKey(name)}`;
export const makeDepartmentNodeId = (name: string): string => `department:${normalizeKey(name)}`;

export interface NamedEntity {
  id: number;
  nome: string;
}

export const buildNamedNodeData = <T extends NamedEntity>(entity: T): GraphNode['data'] => ({
  id: entity.id,
  nome: entity.nome,
});
