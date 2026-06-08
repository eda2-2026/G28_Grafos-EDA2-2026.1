import { ProfessoresService } from './professores.service';

describe('ProfessoresService', () => {
  let service: ProfessoresService;

  const professoresMock = [
    {
      id: 1,
      nome: 'Ana Clara',
      departamento: 'Computação',
      fotosrc: null,
      avaliacoes: [],
      materias: [],
    },
    {
      id: 2,
      nome: 'André Luiz',
      departamento: 'Matemática',
      fotosrc: null,
      avaliacoes: [],
      materias: [],
    },
    {
      id: 3,
      nome: 'Maria Silva',
      departamento: 'Engenharia',
      fotosrc: null,
      avaliacoes: [],
      materias: [],
    },
  ];

  const prismaMock = {
    professores: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock.professores.findMany.mockResolvedValue(professoresMock);

    service = new ProfessoresService(prismaMock as any);
  });

  it('deve buscar professores usando a árvore AVL', async () => {
    const result = await service.searchByTree('an');

    expect(result).toHaveLength(2);
    expect(result.map((professor) => professor.nome)).toEqual([
      'Ana Clara',
      'André Luiz',
    ]);
  });

  it('deve buscar professores usando busca sequencial', async () => {
    const result = await service.searchLinear('an');

    expect(result).toHaveLength(2);
    expect(result.map((professor) => professor.nome)).toEqual([
      'Ana Clara',
      'André Luiz',
    ]);
  });

  it('deve retornar benchmark comparando busca sequencial e AVL', async () => {
    const result = await service.benchmarkSearch('an');

    expect(result.termo).toBe('an');
    expect(result.buscaSequencial.quantidade).toBe(2);
    expect(result.buscaArvoreAvl.quantidade).toBe(2);
    expect(result.buscaSequencial.tempoMs).toBeGreaterThanOrEqual(0);
    expect(result.buscaArvoreAvl.tempoMs).toBeGreaterThanOrEqual(0);
  });

  it('deve reconstruir a árvore após criar professor', async () => {
    const novoProfessor = {
      id: 4,
      nome: 'Antonio Carlos',
      departamento: 'Física',
      fotosrc: null,
      avaliacoes: [],
      materias: [],
    };

    prismaMock.professores.create.mockResolvedValue(novoProfessor);
    prismaMock.professores.findMany.mockResolvedValue([
      ...professoresMock,
      novoProfessor,
    ]);

    await service.create({
      nome: 'Antonio Carlos',
      departamento: 'Física',
      fotosrc: null,
    } as any);

    const result = await service.searchByTree('anto');

    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe('Antonio Carlos');
  });
});