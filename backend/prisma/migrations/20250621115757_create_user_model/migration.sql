/*
  Warnings:

  - You are about to drop the column `fotopsrc` on the `Professores` table. All the data in the column will be lost.
  - You are about to drop the column `fotopsrc` on the `Users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Professores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "materia" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "fotosrc" TEXT
);
INSERT INTO "new_Professores" ("departamento", "id", "materia", "nome") SELECT "departamento", "id", "materia", "nome" FROM "Professores";
DROP TABLE "Professores";
ALTER TABLE "new_Professores" RENAME TO "Professores";
CREATE UNIQUE INDEX "Professores_nome_key" ON "Professores"("nome");
CREATE TABLE "new_Users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "fotosrc" TEXT
);
INSERT INTO "new_Users" ("curso", "departamento", "email", "id", "nome", "senha") SELECT "curso", "departamento", "email", "id", "nome", "senha" FROM "Users";
DROP TABLE "Users";
ALTER TABLE "new_Users" RENAME TO "Users";
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
