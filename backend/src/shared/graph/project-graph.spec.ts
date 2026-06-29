import { ProjectGraph } from './project-graph';

const distanceOf = (
  visits: { nodeId: string; distance: number }[],
  nodeId: string,
): number | undefined =>
  visits.find((visit) => visit.nodeId === nodeId)?.distance;

describe('ProjectGraph.bfs', () => {
  const buildGraph = (): ProjectGraph => {
    const graph = new ProjectGraph();

    graph.addTypedNode('professor', 'professor:1', 'P1');
    graph.addTypedNode('professor', 'professor:2', 'P2');
    graph.addTypedNode('professor', 'professor:3', 'P3');
    graph.addTypedNode('matter', 'matter:x', 'Matéria X');

    graph.connect('professor:1', 'professor:2', 'shares_matter', 2, {
      bidirectional: true,
    });
    graph.connect('professor:2', 'professor:3', 'shares_matter', 2, {
      bidirectional: true,
    });
    graph.connect('professor:1', 'matter:x', 'teaches', 4, {
      bidirectional: true,
    });

    return graph;
  };

  it('visita os nós em ordem crescente de distância, incluindo a origem', () => {
    const visits = buildGraph().bfs('professor:1');

    expect(visits[0]).toEqual({ nodeId: 'professor:1', distance: 0 });
    expect(distanceOf(visits, 'professor:2')).toBe(1);
    expect(distanceOf(visits, 'matter:x')).toBe(1);
    expect(distanceOf(visits, 'professor:3')).toBe(2);

    const distances = visits.map((visit) => visit.distance);
    const sorted = [...distances].sort((a, b) => a - b);
    expect(distances).toEqual(sorted);
  });

  it('respeita a profundidade máxima', () => {
    const visits = buildGraph().bfs('professor:1', { maxDepth: 1 });

    expect(distanceOf(visits, 'professor:2')).toBe(1);
    expect(distanceOf(visits, 'professor:3')).toBeUndefined();
  });

  it('percorre apenas os tipos de relação permitidos', () => {
    const visits = buildGraph().bfs('professor:1', {
      relationKinds: ['shares_matter'],
    });

    expect(distanceOf(visits, 'professor:3')).toBe(2);
    expect(distanceOf(visits, 'matter:x')).toBeUndefined();
  });

  it('não revisita nós em grafos com ciclos', () => {
    const graph = buildGraph();
    graph.connect('professor:3', 'professor:1', 'shares_matter', 2, {
      bidirectional: true,
    });

    const visits = graph.bfs('professor:1');
    const uniqueIds = new Set(visits.map((visit) => visit.nodeId));

    expect(uniqueIds.size).toBe(visits.length);
  });

  it('retorna vazio quando a origem não existe', () => {
    expect(buildGraph().bfs('professor:999')).toEqual([]);
  });
});
