-- CreateTable
CREATE TABLE "Notificacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usersId" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "link" TEXT,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "tipo" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notificacoes_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
