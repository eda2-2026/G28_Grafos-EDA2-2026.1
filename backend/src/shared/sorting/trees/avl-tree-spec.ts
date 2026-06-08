import { AvlTree } from './avl-tree';

describe('AvlTree', () => {
  let tree: AvlTree<{ id: number; nome: string }>;

  beforeEach(() => {
    tree = new AvlTree<{ id: number; nome: string }>();
  });

  it('deve inserir e buscar um professor pela chave exata', () => {
    const professor = { id: 1, nome: 'Ana Clara' };

    tree.insert('ana clara', professor);

    expect(tree.search('ana clara')).toEqual([professor]);
  });

  it('deve retornar vazio quando a chave não existir', () => {
    expect(tree.search('joao')).toEqual([]);
  });

  it('deve buscar professores pelo prefixo do nome', () => {
    const ana = { id: 1, nome: 'Ana Clara' };
    const andre = { id: 2, nome: 'André Luiz' };
    const maria = { id: 3, nome: 'Maria Silva' };

    tree.insert('ana clara', ana);
    tree.insert('andre luiz', andre);
    tree.insert('maria silva', maria);

    expect(tree.searchPrefix('an')).toEqual([ana, andre]);
  });

  it('deve remover um professor da árvore', () => {
    const professor = { id: 1, nome: 'Ana Clara' };

    tree.insert('ana clara', professor);
    tree.remove('ana clara');

    expect(tree.search('ana clara')).toEqual([]);
  });
});