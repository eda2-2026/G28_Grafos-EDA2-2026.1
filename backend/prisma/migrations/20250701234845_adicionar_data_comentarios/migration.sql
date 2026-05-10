-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comentarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usersId" INTEGER NOT NULL,
    "conteudo" TEXT NOT NULL,
    "avaliacaoId" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comentarios_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comentarios_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "Avaliacoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Comentarios" ("avaliacaoId", "conteudo", "id", "usersId") SELECT "avaliacaoId", "conteudo", "id", "usersId" FROM "Comentarios";
DROP TABLE "Comentarios";
ALTER TABLE "new_Comentarios" RENAME TO "Comentarios";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
