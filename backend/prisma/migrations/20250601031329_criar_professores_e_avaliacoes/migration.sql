-- CreateTable
CREATE TABLE "Professores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "materia" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Avaliacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "avaliacao" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "profId" INTEGER NOT NULL,
    CONSTRAINT "Avaliacoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Avaliacoes_profId_fkey" FOREIGN KEY ("profId") REFERENCES "Professores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Professores_nome_key" ON "Professores"("nome");
