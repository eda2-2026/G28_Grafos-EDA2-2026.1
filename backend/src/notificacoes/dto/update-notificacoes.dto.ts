export type NotificacaoTipo = 'NOVO_COMENTARIO' | 'NOVO_PROFESSOR'; 

export type NotificacoesDtoUpdate = {
  id?: number;
  usersId?: number;
  texto?: string;
  link?: string;
  lida?: boolean;
  tipo?: NotificacaoTipo;
  data?: Date;
};