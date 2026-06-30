import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getOneUser = async (id: number) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getAllProf = async () => {
  const response = await api.get("/professores");
  return response.data;
};

export const getOneProf = async (id: number) => {
  const response = await api.get(`/professores/${id}`);
  return response.data;
};

export type ProfessorRecommendation = {
  professorId: number;
  nodeId: string;
  nome: string;
  distance: number;
  score: number;
  breakdown: {
    sharedMatters: number;
    sharedDepartments: number;
    evaluations: number;
    comments: number;
  };
};

export type ProfessorNetwork = {
  professorId: number;
  professor: {
    id: string;
    kind: string;
    label: string;
  } | null;
  conexoesDiretas: Array<{
    from: string;
    to: string;
    kind: string;
    weight: number;
  }>;
  recomendacoes: ProfessorRecommendation[];
};

export const getProfessorNetwork = async (id: number): Promise<ProfessorNetwork> => {
  const response = await api.get(`/graph/professores/${id}/rede?limit=4`);
  return response.data;
};

export type UserProfessorRecommendation = {
  professorId: number;
  nodeId: string;
  nome: string;
  score: number;
  baseadoEm: Array<{
    professorId: number;
    nome: string;
  }>;
};

export type UserRecommendations = {
  userId: number;
  total: number;
  recomendacoes: UserProfessorRecommendation[];
};

export const getUserRecommendations = async (id: number): Promise<UserRecommendations> => {
  const response = await api.get(`/graph/usuarios/${id}/recomendacoes?limit=4`);
  return response.data;
};

export const getAvaliacoesByUser = async (userId: number) => {
  const response = await api.get("/avaliacoes");
  return response.data.filter((avaliacao: any) => avaliacao.userId === userId);
};

export const getAvaliacoesByProf = async (profId: number) => {
  const response = await api.get("/avaliacoes");
  return response.data.filter((avaliacao: any) => avaliacao.profId === profId);
};

export const registerUser = async (nome: string, email: string, senha: string, curso: string, departamento: string) => {
  const response = await api.post("/users", { nome, email, senha, curso, departamento });
  return response.data;
};

export const loginUser = async (email: string, senha: string) => {
  const response = await api.post("/login", { email, senha });
  return response.data;
};

export const deleteAvaliacao = async (id: number) => {
  const response = await api.delete(`/avaliacoes/${id}`);
  return response.data;
};

export const updateAvaliacao = async (id: number, avaliacao: string) => {
  const response = await api.patch(`/avaliacoes/${id}`, { avaliacao });
  return response.data;
};

export const postAvaliacao = async (avaliacao: string, materia: string, userId: number, profId: number) => {
  const response = await api.post("/avaliacoes", { avaliacao, materia, userId, profId });
  return response.data;
};

export const deleteComentario = async (id: number) => {
  const response = await api.delete(`/comentarios/${id}`);
  return response.data;
};

export const updateComentario = async (id: number, conteudo: string) => {
  const response = await api.patch(`/comentarios/${id}`, { conteudo });
  return response.data;
};

export const postComentario = async (conteudo: string, usersId: number, avaliacaoId: number) => {
  const response = await api.post("/comentarios", { conteudo, usersId, avaliacaoId });
  return response.data;
};

export const getComentariosCount = async (avaliacaoId: number) => {
  const response = await api.get(`/comentarios/count/${avaliacaoId}`);
  return response.data.count;
};

export const getOneAvaliacao = async (id: number) => {
  const response = await api.get(`/avaliacoes/${id}`);
  return response.data;
};

export const getComentariosByAvaliacao = async (avaliacaoId: number) => {
  const response = await api.get(`/comentarios?avaliacaoId=${avaliacaoId}`);
  return response.data;
};

export const getNotificacoesByUser = async (userId: number) => {
  const response = await api.get(`/notificacoes/user/${userId}`);
  return response.data;
};

export const createNotificacao = async (notificacao: {
  usersId: number;
  texto: string;
  link?: string;
  tipo: 'NOVO_COMENTARIO' | 'NOVO_PROFESSOR';
  lida?: boolean;
}) => {
  const response = await api.post('/notificacoes', notificacao);
  return response.data;
};

export const marcarTodasNotificacoesComoLidas = async (userId: number) => {
  const response = await api.patch(`/notificacoes/marcar-todas-lidas/${userId}`);
  return response.data;
};

export const countNaoLidas = async (userId: number) => {
  const response = await api.get(`/notificacoes/count/nao-lidas/${userId}`);
  return response.data;
};

export const updateUser = async (id: number, userData: {
  nome?: string;
  email?: string;
  curso?: string;
  departamento?: string;
  fotosrc?: string; 
}) => {
  const response = await api.patch(`/users/${id}`, userData);
  return response.data;
};

export const changePassword = async (id: number, senhaAntiga: string, novaSenha: string) => {
  const response = await api.patch(`/users/change-password/${id}`, { senhaAntiga, novaSenha });
  return response.data;
};

export const deleteUserAccount = async (id: number, senha: string) => {
  const response = await api.post(`/users/delete-account/${id}`, { senha });
  return response.data;
};

export const uploadPhoto = async (userId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file); 

  const response = await api.post(`/users/${userId}/upload-photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; 
};

export const profileImageLoader = ({ src }: { src?: string | null }): string => {
  const defaultImage = "/profileSemFoto/profileSemFoto.jpg";
  const backendUrl = "http://localhost:3001";

  if (!src) {
    return defaultImage;
  }

  if (src.startsWith("http") || src.startsWith("blob:")) {
    return src;
  }

  if (src.startsWith("/")) {
    return `${backendUrl}${src}`;
  }

  return defaultImage;
};

export const createProfessor = async (data: FormData, isFormData = true) => {
  if (isFormData) {
    return api.post('/professores', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  return api.post('/professores', data);
};
