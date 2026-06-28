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
