/*
  Warnings:

  - You are about to drop the column `materia` on the `Professores` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Materias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "profId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_MateriasToProfessores" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MateriasToProfessores_A_fkey" FOREIGN KEY ("A") REFERENCES "Materias" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MateriasToProfessores_B_fkey" FOREIGN KEY ("B") REFERENCES "Professores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Professores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "fotosrc" TEXT
);
INSERT INTO "new_Professores" ("departamento", "fotosrc", "id", "nome") SELECT "departamento", "fotosrc", "id", "nome" FROM "Professores";
DROP TABLE "Professores";
ALTER TABLE "new_Professores" RENAME TO "Professores";
CREATE UNIQUE INDEX "Professores_nome_key" ON "Professores"("nome");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_MateriasToProfessores_AB_unique" ON "_MateriasToProfessores"("A", "B");

-- CreateIndex
CREATE INDEX "_MateriasToProfessores_B_index" ON "_MateriasToProfessores"("B");
