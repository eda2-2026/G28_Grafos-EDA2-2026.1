import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  makeCommentNodeId,
  makeDepartmentNodeId,
  makeEvaluationNodeId,
  makeMatterNodeId,
  makeProfessorNodeId,
  makeUserNodeId,
  normalizeKey,
} from './graph.factory';
import { ProjectGraph } from './project-graph';
import { GraphSnapshot } from './project-graph.types';

@Injectable()
export class ProjectGraphService {
  constructor(private readonly prisma: PrismaService) {}

  async buildBaseGraph(): Promise<ProjectGraph> {
    const graph = new ProjectGraph();

    const [users, professors, evaluations, comments, matters] = await Promise.all([
      this.prisma.users.findMany(),
      this.prisma.professores.findMany({ include: { materias: true } }),
      this.prisma.avaliacoes.findMany(),
      this.prisma.comentarios.findMany(),
      this.prisma.materias.findMany(),
    ]);

    const matterNodeIds = new Map<string, string>();
    const departmentNodeIds = new Map<string, string>();

    matters.forEach((matter) => {
      const matterId = makeMatterNodeId(matter.nome);
      matterNodeIds.set(normalizeKey(matter.nome), matterId);
      graph.addTypedNode('matter', matterId, matter.nome, {
        id: matter.id,
        nome: matter.nome,
      });
    });

    users.forEach((user) => {
      const userNodeId = makeUserNodeId(user.id);
      graph.addTypedNode('user', userNodeId, user.nome, {
        id: user.id,
        nome: user.nome,
        departamento: user.departamento,
        curso: user.curso,
      });

      const departmentNodeId = this.ensureDepartmentNode(graph, departmentNodeIds, user.departamento);
      graph.connect(userNodeId, departmentNodeId, 'belongs_to_department', 1, {
        bidirectional: true,
      });
    });

    professors.forEach((professor) => {
      const professorNodeId = makeProfessorNodeId(professor.id);
      graph.addTypedNode('professor', professorNodeId, professor.nome, {
        id: professor.id,
        nome: professor.nome,
        departamento: professor.departamento,
      });

      const departmentNodeId = this.ensureDepartmentNode(graph, departmentNodeIds, professor.departamento);
      graph.connect(professorNodeId, departmentNodeId, 'belongs_to_department', 3, {
        bidirectional: true,
      });

      professor.materias.forEach((matter) => {
        const matterNodeId = this.ensureMatterNode(graph, matterNodeIds, matter.nome, matter.id);

        graph.connect(professorNodeId, matterNodeId, 'teaches', 4, {
          bidirectional: true,
        });
      });
    });

    evaluations.forEach((evaluation) => {
      const evaluationNodeId = makeEvaluationNodeId(evaluation.id);
      const professorNodeId = makeProfessorNodeId(evaluation.profId);
      const userNodeId = makeUserNodeId(evaluation.userId);
      const matterNodeId = this.ensureMatterNode(graph, matterNodeIds, evaluation.materia);

      graph.addTypedNode('evaluation', evaluationNodeId, `Avaliação ${evaluation.id}`, {
        id: evaluation.id,
        avaliacao: evaluation.avaliacao,
        materia: evaluation.materia,
        data: evaluation.data,
      });

      graph.connect(userNodeId, evaluationNodeId, 'authored', 3, { bidirectional: true });
      graph.connect(evaluationNodeId, professorNodeId, 'about_professor', 5, { bidirectional: true });
      graph.connect(evaluationNodeId, matterNodeId, 'references_matter', 2, { bidirectional: true });
    });

    comments.forEach((comment) => {
      const commentNodeId = makeCommentNodeId(comment.id);
      const userNodeId = makeUserNodeId(comment.usersId);
      const evaluationNodeId = makeEvaluationNodeId(comment.avaliacaoId);

      graph.addTypedNode('comment', commentNodeId, `Comentário ${comment.id}`, {
        id: comment.id,
        conteudo: comment.conteudo,
        data: comment.data,
      });

      graph.connect(userNodeId, commentNodeId, 'written_by', 2, { bidirectional: true });
      graph.connect(commentNodeId, evaluationNodeId, 'commented_on', 3, { bidirectional: true });
    });

    this.addSharedProfessorEdges(graph, professors);

    return graph;
  }

  async buildBaseGraphSnapshot(): Promise<GraphSnapshot> {
    return (await this.buildBaseGraph()).toJSON();
  }

  private ensureMatterNode(
    graph: ProjectGraph,
    registry: Map<string, string>,
    matterName: string,
    matterId?: number,
  ): string {
    const normalizedMatterName = normalizeKey(matterName);
    const existingId = registry.get(normalizedMatterName);

    if (existingId) {
      return existingId;
    }

    const nodeId = makeMatterNodeId(matterName);
    registry.set(normalizedMatterName, nodeId);

    graph.addTypedNode('matter', nodeId, matterName, {
      id: matterId ?? null,
      nome: matterName,
      virtual: matterId == null,
    });

    return nodeId;
  }

  private ensureDepartmentNode(
    graph: ProjectGraph,
    registry: Map<string, string>,
    departmentName: string,
  ): string {
    const normalizedDepartmentName = normalizeKey(departmentName);
    const existingId = registry.get(normalizedDepartmentName);

    if (existingId) {
      return existingId;
    }

    const nodeId = makeDepartmentNodeId(departmentName);
    registry.set(normalizedDepartmentName, nodeId);

    graph.addTypedNode('department', nodeId, departmentName, {
      nome: departmentName,
      virtual: true,
    });

    return nodeId;
  }

  private addSharedProfessorEdges(
    graph: ProjectGraph,
    professors: Array<{ id: number; nome: string; departamento: string; materias: Array<{ nome: string }> }>,
  ): void {
    const professorsByMatter = new Map<string, number[]>();
    const professorsByDepartment = new Map<string, number[]>();

    professors.forEach((professor) => {
      const professorId = professor.id;
      const departmentKey = normalizeKey(professor.departamento);

      const departmentList = professorsByDepartment.get(departmentKey) ?? [];
      departmentList.push(professorId);
      professorsByDepartment.set(departmentKey, departmentList);

      professor.materias.forEach((matter) => {
        const matterKey = normalizeKey(matter.nome);
        const matterList = professorsByMatter.get(matterKey) ?? [];
        matterList.push(professorId);
        professorsByMatter.set(matterKey, matterList);
      });
    });

    professorsByMatter.forEach((professorIds) => {
      this.connectUniqueProfessorPairs(graph, professorIds, 'shares_matter', 2);
    });

    professorsByDepartment.forEach((professorIds) => {
      this.connectUniqueProfessorPairs(graph, professorIds, 'shares_department', 1);
    });
  }

  private connectUniqueProfessorPairs(
    graph: ProjectGraph,
    professorIds: number[],
    kind: 'shares_matter' | 'shares_department',
    weight: number,
  ): void {
    const uniqueIds = [...new Set(professorIds)];

    for (let i = 0; i < uniqueIds.length; i += 1) {
      for (let j = i + 1; j < uniqueIds.length; j += 1) {
        const from = makeProfessorNodeId(uniqueIds[i]);
        const to = makeProfessorNodeId(uniqueIds[j]);

        graph.connect(from, to, kind, weight, {
          bidirectional: true,
        });
      }
    }
  }
}
