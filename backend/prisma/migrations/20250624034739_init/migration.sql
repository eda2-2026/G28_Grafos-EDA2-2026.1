/*
  Warnings:

  - Added the required column `materia` to the `Avaliacoes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Avaliacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "avaliacao" TEXT NOT NULL,
    "materia" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "profId" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Avaliacoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Avaliacoes_profId_fkey" FOREIGN KEY ("profId") REFERENCES "Professores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Avaliacoes" ("avaliacao", "data", "id", "profId", "userId") SELECT "avaliacao", "data", "id", "profId", "userId" FROM "Avaliacoes";
DROP TABLE "Avaliacoes";
ALTER TABLE "new_Avaliacoes" RENAME TO "Avaliacoes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
