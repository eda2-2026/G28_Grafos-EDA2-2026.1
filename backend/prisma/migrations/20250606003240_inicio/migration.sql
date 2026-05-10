-- CreateTable
CREATE TABLE "Comentarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usersId" INTEGER NOT NULL,
    "conteudo" TEXT NOT NULL,
    "avaliacaoId" INTEGER NOT NULL,
    CONSTRAINT "Comentarios_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comentarios_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "Avaliacoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
