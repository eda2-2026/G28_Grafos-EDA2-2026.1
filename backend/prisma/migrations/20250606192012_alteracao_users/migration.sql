/*
  Warnings:

  - Added the required column `curso` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departamento` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "curso" TEXT NOT NULL
);
INSERT INTO "new_Users" ("email", "id", "nome", "senha") SELECT "email", "id", "nome", "senha" FROM "Users";
DROP TABLE "Users";
ALTER TABLE "new_Users" RENAME TO "Users";
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
