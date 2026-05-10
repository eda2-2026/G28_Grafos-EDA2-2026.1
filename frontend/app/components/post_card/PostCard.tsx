"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaRegComment, FaTrash, FaEdit } from "react-icons/fa";
import { deleteAvaliacao, getComentariosCount, profileImageLoader } from "@/app/utils/api";
import { jwtDecode } from "jwt-decode";
import Mcomentario from "../m_comentario/M_Comentario";
import MeditAvaliacao from "../m_editar_avaliacao/M_Editar_Avaliacao";

interface PostCardProps {
  id: number;
  userId: number;        // <-- ID do autor do comentário
  userName: string;
  userImage: string;
  postDate: string;
  nomeProfessor: string;
  materia: string;
  postContent: string;
  onAction?: () => void; 
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  userId,    
  userName,
  userImage,
  postDate,
  nomeProfessor,
  materia,
  postContent,
  onAction, 
}) => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [comentariosCount, setComentariosCount] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: { sub?: string } = jwtDecode(token);
        if (decoded.sub) {
          setCurrentUserId(Number(decoded.sub)); // <-- usuário logado
        }
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      }
    }
  }, []);

  useEffect(() => {
    getComentariosCount(id)
      .then(setComentariosCount)
      .catch(() => setComentariosCount(0));
  }, [id]);

  const canEditOrDelete = currentUserId === userId;

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    if (onAction) {
      onAction(); 
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta avaliação?")) {
      await deleteAvaliacao(id);
      if (onAction) {
        onAction(); 
      }
    }
  };

  return (
    <div className="bg-yellow-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Link href={{ pathname: "/perfilDeUsuario", query: { id: userId } }}>
          <img
            src={profileImageLoader({ src: userImage })}
            alt={userName}
            className="w-12 h-12 rounded-full object-cover cursor-pointer"
            onError={(e) => { (e.target as HTMLImageElement).src = "/profileSemFoto/profileSemFoto.jpg"; }}
          />
        </Link>
        <div>
          <p className="font-bold text-[#050036] text-base">
            {userName}{" "}
            <span className="font-normal text-sm text-gray-600">
              · {postDate} · {nomeProfessor} · {materia}
            </span>
          </p>
        </div>
      </div>

      <p
        className="text-[#050036] text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: postContent }}
      />

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2 text-gray-700">
          <button onClick={() => setIsCommentModalOpen(true)}>
            <FaRegComment className="text-xl hover:text-blue-600 transition" />
          </button>
          <Link href={{ pathname: '/Avaliacao', query: { id } }} className="text-sm hover:underline cursor-pointer">
            Ver {comentariosCount ?? "..."} comentários
          </Link>
        </div>
        {canEditOrDelete && (
          <div className="flex gap-4 text-gray-600">
            <button onClick={() => setIsEditModalOpen(true)} title="Editar">
              <FaEdit className="text-lg hover:text-blue-600 transition" />
            </button>
            <button onClick={handleDelete} title="Excluir">
              <FaTrash className="text-lg hover:text-red-600 transition" />
            </button>
          </div>
        )}
      </div>

      <Mcomentario
        isOpen={isCommentModalOpen}
        onCloseAction={() => setIsCommentModalOpen(false)}
        avaliacaoId={id}
      />

      <MeditAvaliacao
        isOpen={isEditModalOpen}
        onCloseAction={handleEditModalClose} 
        avaliacaoId={id}
        avaliacaoAtual={postContent}
      />
    </div>
  );
};

export default PostCard;
