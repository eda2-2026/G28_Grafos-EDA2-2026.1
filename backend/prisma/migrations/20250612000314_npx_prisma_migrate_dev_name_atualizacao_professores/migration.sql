/*
  Warnings:

  - Added the required column `departamento` to the `Professores` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Professores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "materia" TEXT NOT NULL,
    "departamento" TEXT NOT NULL
);
INSERT INTO "new_Professores" ("id", "materia", "nome") SELECT "id", "materia", "nome" FROM "Professores";
DROP TABLE "Professores";
ALTER TABLE "new_Professores" RENAME TO "Professores";
CREATE UNIQUE INDEX "Professores_nome_key" ON "Professores"("nome");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
