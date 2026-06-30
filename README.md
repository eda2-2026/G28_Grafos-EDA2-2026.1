# Grafos - Fui Com a Cara

Esse repositório documenta a aplicação de **grafos** em um sistema de avaliação de professores, desenvolvido como trabalho 4 da disciplina de Estruturas de Dados 2 da Universidade de Brasília, no semestre 26.1.

A proposta do trabalho foi usar uma base já existente e aplicar uma estrutura de dados que trouxesse ganho real no sistema. No nosso caso, a equipe escolheu dividir a implementação entre backend e frontend, usando **TypeScript** como tecnologia principal.

## Alunas

| Matrícula | Nome |
| -- | -- |
| 231026840  | Laryssa Felix Lopes |
| 231035731 |  Mayara Marques Silva |

## Vídeo de Apresentação

[Link da Apresentação]()

## Sobre o Projeto

O **Fui Com a Cara** é uma plataforma de avaliação de professores. A aplicação permite cadastrar professores, consultar perfis, registrar avaliações, comentar experiências e navegar por informações acadêmicas como departamento e matérias.

Neste trabalho, o objetivo foi aplicar **grafos** sobre essa base de dados já existente. A ideia não foi substituir o banco relacional ou alterar o CRUD principal, mas criar uma camada de análise em cima das relações naturais do sistema.

Com isso, o projeto passou a representar usuários, professores, avaliações, comentários, matérias e departamentos como uma rede. Essa rede é usada para encontrar professores relacionados e exibir recomendações diretamente no perfil de cada professor.

## Modelagem do Problema

O sistema possui várias entidades que se conectam naturalmente:

| Entidade | Papel no grafo |
| -- | -- |
| Usuário | Autor de avaliações e comentários |
| Professor | Nó principal usado nas recomendações |
| Avaliação | Liga um usuário a um professor e a uma matéria |
| Comentário | Representa interação em uma avaliação |
| Matéria | Aproxima professores que lecionam conteúdos semelhantes |
| Departamento | Aproxima professores e usuários de uma mesma área |

A partir dessas relações, o problema pode ser modelado como uma rede de conexões.

Exemplo:

| Origem | Relação | Destino |
| -- | -- | -- |
| Professor | leciona | Matéria |
| Professor | pertence ao departamento | Departamento |
| Usuário | escreveu | Avaliação |
| Avaliação | é sobre | Professor |
| Comentário | comenta | Avaliação |
| Professor | compartilha matéria | Professor |
| Professor | compartilha departamento | Professor |

Assim, em vez de analisar cada professor isoladamente, o sistema consegue responder perguntas como:

- Quais professores estão relacionados a este professor?
- Quais professores compartilham matéria ou departamento?
- Quais professores possuem maior engajamento por avaliações e comentários?
- Quais recomendações fazem sentido para aparecer no perfil?

## Estrutura de Dados Utilizada: Grafo

O grafo foi implementado no backend com **lista de adjacência**.

Cada nó representa uma entidade do sistema e cada aresta representa uma relação entre entidades. Algumas arestas são bidirecionais, pois a navegação faz sentido nos dois sentidos, como professor ligado a matéria ou avaliação ligada a professor.

Tipos de nós usados:

- `user`
- `professor`
- `evaluation`
- `comment`
- `matter`
- `department`

Tipos de relações usadas:

- `authored`: usuário escreveu uma avaliação
- `about_professor`: avaliação é sobre um professor
- `references_matter`: avaliação referencia uma matéria
- `written_by`: comentário foi escrito por um usuário
- `commented_on`: comentário pertence a uma avaliação
- `teaches`: professor leciona uma matéria
- `belongs_to_department`: professor ou usuário pertence a um departamento
- `shares_matter`: professores compartilham matéria
- `shares_department`: professores compartilham departamento

Essa modelagem permite representar tanto relações diretas quanto relações indiretas entre professores.

## Algoritmo Utilizado

Para encontrar professores relacionados, foi utilizada **Busca em Largura (BFS)**.

O funcionamento pode ser resumido em:

1. O sistema recebe um professor de origem.
2. O grafo é montado a partir dos dados salvos no banco.
3. A BFS começa no nó desse professor.
4. A busca percorre arestas de afinidade entre professores, como `shares_matter` e `shares_department`.
5. Os professores encontrados são candidatos à recomendação.
6. Cada candidato recebe uma pontuação.
7. O sistema ordena os candidatos do mais relevante para o menos relevante.

No contexto do projeto:

- compartilhar matéria tem peso maior;
- compartilhar departamento tem peso intermediário;
- avaliações e comentários aumentam a relevância do professor recomendado;
- a distância na BFS ajuda a priorizar professores mais próximos na rede.

Pesos padrão do ranking:

| Critério | Peso |
| -- | -- |
| Matéria em comum | 4 |
| Departamento em comum | 2 |
| Avaliação | 1 |
| Comentário | 0.5 |

## Funcionamento no Sistema

A funcionalidade de grafos aparece principalmente no perfil de professor.

Ao abrir o perfil, o frontend busca:

- dados do professor;
- avaliações desse professor;
- rede de professores relacionados.

A seção **Rede de professores** mostra recomendações calculadas a partir do grafo. Cada recomendação apresenta:

- nome do professor relacionado;
- pontuação calculada pelo ranking;
- quantidade de matérias e departamentos em comum;
- navegação direta para o perfil recomendado.

Também foram tratados estados de interface:

- carregamento da rede;
- erro ao buscar recomendações;
- ausência de professores relacionados;
- foco e navegação visual nos cards de recomendação.

## Endpoints de Grafos

Foram criados endpoints específicos para consultar as recomendações e a rede de um professor.

### Recomendações de um professor

```http
GET /graph/professores/:id/recomendacoes
```

Parâmetros opcionais:

| Parâmetro | Descrição |
| -- | -- |
| `limit` | quantidade máxima de recomendações |
| `maxDepth` | profundidade máxima da BFS |

### Rede de um professor

```http
GET /graph/professores/:id/rede
```

Retorna:

- professor consultado;
- conexões diretas no grafo;
- recomendações ranqueadas;
- opcionalmente, o grafo completo.

Parâmetros opcionais:

| Parâmetro | Descrição |
| -- | -- |
| `limit` | quantidade máxima de recomendações |
| `maxDepth` | profundidade máxima da BFS |
| `incluirGrafoCompleto` | quando `true`, retorna o snapshot completo do grafo |

## Complexidade

A montagem do grafo depende da quantidade de entidades e relações carregadas do banco.

Considerando:

- `V` como o número de vértices;
- `E` como o número de arestas.

A BFS possui complexidade:

```text
O(V + E)
```

Como a recomendação limita a profundidade da busca e usa principalmente relações de afinidade entre professores, a consulta fica adequada para o uso no perfil sem precisar ordenar ou percorrer manualmente todos os relacionamentos da aplicação no frontend.

## Justificativa da Escolha

Grafos foram escolhidos porque o domínio do sistema é naturalmente relacional.

Professores não estão conectados apenas por um campo isolado. Eles podem se aproximar por matérias, departamentos, avaliações, comentários e interações dos usuários. Representar essas relações como grafo permite transformar dados já existentes em recomendações úteis.

A estrutura também facilita explicar o conteúdo da disciplina: nós representam entidades, arestas representam relações, pesos representam força de conexão e a BFS mostra como percorrer a rede para encontrar candidatos relacionados.

## Estrutura da Implementação

```text
backend/src/shared/graph
├── project-graph.ts
│   └── Estrutura base do grafo com lista de adjacência e BFS
├── project-graph.service.ts
│   └── Monta o grafo a partir dos dados do Prisma
├── graph-recommendation.service.ts
│   └── Calcula recomendações e ranking de professores relacionados
├── graph.controller.ts
│   └── Expõe endpoints para recomendações e rede de professores
├── dto/graph-query.dto.ts
│   └── Define parâmetros de consulta dos endpoints
└── project-graph.types.ts
    └── Tipos de nós, arestas, opções de BFS e respostas de ranking
```

```text
frontend/app
├── utils/api.ts
│   └── Consome os endpoints de grafo
└── perfilDeProfessor/page.tsx
    └── Exibe a rede de professores no perfil
```

## Divisão das Entregas

As entregas foram organizadas em commits pequenos para manter a evolução do trabalho clara:

1. `feat(graph): expor endpoints de recomendações`
2. `feat(ui): exibir rede de professores no perfil`
3. `feat(ui): polir estados vazios e navegação`
4. `docs: explicar uso de grafos no projeto`

## Como rodar o projeto 

### Pré-requisitos
- Node.js (v18+)

### Rodando o Backend

1. Navegue até a pasta do backend:
```bash
cd G28_Grafos-EDA2-2026.1\backend
```

2. Crie um arquivo `.env` na raiz da pasta backend com as seguintes variáveis:
```env
JWT_SECRET="sua_chave_secreta_muito_segura_aqui_minimo_32_caracteres"
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV="development"
```

> **Nota**: O `JWT_SECRET` deve ter no mínimo 32 caracteres por segurança. Gere uma chave forte se possível.

3. Instale as dependências:
```bash
npm install
```

4. Configure o banco de dados (gere o cliente Prisma e aplique as migrations):
```bash
npx prisma generate
npx prisma migrate deploy
```

5. Inicie o servidor:

```bash
npm run start:dev
```

O servidor estará disponível em `http://localhost:3001`

### Rodando o Frontend

1. Em uma **nova aba do terminal**, navegue até a pasta do frontend:
```bash
cd G28_Grafos-EDA2-2026.1\frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`
