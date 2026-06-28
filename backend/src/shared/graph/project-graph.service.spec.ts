import { ProjectGraphService } from './project-graph.service';

describe('ProjectGraphService', () => {
  it('builds a graph with base project relations', async () => {
    const prismaMock = {
      users: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            nome: 'Ana',
            departamento: 'Computacao',
            curso: 'Engenharia',
          },
        ]),
      },
      professores: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 10,
            nome: 'Professor A',
            departamento: 'Computacao',
            materias: [{ id: 20, nome: 'Grafos' }],
          },
          {
            id: 11,
            nome: 'Professor B',
            departamento: 'Computacao',
            materias: [{ id: 20, nome: 'Grafos' }],
          },
        ]),
      },
      avaliacoes: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 100,
            avaliacao: 'Bom professor',
            materia: 'Grafos',
            userId: 1,
            profId: 10,
            data: new Date('2026-06-28T10:00:00.000Z'),
          },
        ]),
      },
      comentarios: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 200,
            conteudo: 'Concordo',
            avaliacaoId: 100,
            usersId: 1,
            data: new Date('2026-06-28T11:00:00.000Z'),
          },
        ]),
      },
      materias: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 20,
            nome: 'Grafos',
          },
        ]),
      },
    };

    const service = new ProjectGraphService(prismaMock as never);
    const graph = await service.buildBaseGraph();
    const snapshot = graph.toJSON();

    expect(snapshot.nodes).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'user:1', kind: 'user' }),
      expect.objectContaining({ id: 'professor:10', kind: 'professor' }),
      expect.objectContaining({ id: 'evaluation:100', kind: 'evaluation' }),
      expect.objectContaining({ id: 'comment:200', kind: 'comment' }),
      expect.objectContaining({ id: 'matter:grafos', kind: 'matter' }),
      expect.objectContaining({ id: 'department:computacao', kind: 'department' }),
    ]));

    expect(graph.getOutgoingEdges('professor:10')).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'teaches' }),
      expect.objectContaining({ kind: 'belongs_to_department' }),
      expect.objectContaining({ kind: 'shares_matter' }),
      expect.objectContaining({ kind: 'shares_department' }),
    ]));

    expect(graph.getOutgoingEdges('user:1')).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'belongs_to_department' }),
      expect.objectContaining({ kind: 'authored' }),
      expect.objectContaining({ kind: 'written_by' }),
    ]));
  });
});
