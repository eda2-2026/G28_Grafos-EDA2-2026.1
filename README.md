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

