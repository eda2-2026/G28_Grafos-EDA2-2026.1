/*
  Warnings:

  - You are about to drop the column `profId` on the `Materias` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Materias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);
INSERT INTO "new_Materias" ("id", "nome") SELECT "id", "nome" FROM "Materias";
DROP TABLE "Materias";
ALTER TABLE "new_Materias" RENAME TO "Materias";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
