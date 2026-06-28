import {
  GraphEdge,
  GraphNode,
  GraphNodeKind,
  GraphRelationKind,
  GraphSnapshot,
} from './project-graph.types';

export interface ConnectOptions<TData = Record<string, unknown>> {
  bidirectional?: boolean;
  data?: TData;
}

export class ProjectGraph {
  private readonly nodes = new Map<string, GraphNode>();

  private readonly adjacency = new Map<string, GraphEdge[]>();

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);

    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, []);
    }
  }

  addTypedNode(
    kind: GraphNodeKind,
    id: string,
    label: string,
    data: Record<string, unknown> = {},
  ): GraphNode {
    const node: GraphNode = { id, kind, label, data };

    this.addNode(node);

    return node;
  }

  connect(
    from: string,
    to: string,
    kind: GraphRelationKind,
    weight: number,
    options: ConnectOptions = {},
  ): void {
    const edge: GraphEdge = {
      from,
      to,
      kind,
      weight,
      bidirectional: options.bidirectional ?? false,
      data: options.data ?? {},
    };

    this.pushEdge(edge);

    if (edge.bidirectional) {
      this.pushEdge({
        ...edge,
        from: edge.to,
        to: edge.from,
      });
    }
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getOutgoingEdges(id: string): GraphEdge[] {
    return [...(this.adjacency.get(id) ?? [])];
  }

  getNeighbors(id: string): GraphNode[] {
    const outgoingEdges = this.getOutgoingEdges(id);

    return outgoingEdges
      .map((edge) => this.nodes.get(edge.to))
      .filter((node): node is GraphNode => Boolean(node));
  }

  toJSON(): GraphSnapshot {
    return {
      nodes: [...this.nodes.values()],
      edges: [...this.adjacency.values()].flat(),
    };
  }

  private pushEdge(edge: GraphEdge): void {
    if (!this.nodes.has(edge.from)) {
      throw new Error(`Node not found: ${edge.from}`);
    }

    if (!this.nodes.has(edge.to)) {
      throw new Error(`Node not found: ${edge.to}`);
    }

    const edges = this.adjacency.get(edge.from) ?? [];
    edges.push(edge);
    this.adjacency.set(edge.from, edges);
  }
}
