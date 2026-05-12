"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NavBar from "../components/navbar/NavBar";
import PostCard from "../components/post_card/PostCard";
import { getOneUser, getAvaliacoesByUser, getOneProf, profileImageLoader } from "../utils/api";
import { FaArrowLeft, FaEnvelope, FaBuilding } from "react-icons/fa";
import ModalEditarPerfil from "../components/m_editar_perfil/M_Editar_Perfil";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../contexts/AuthContext";
import { mergeSort } from "../utils/sortingAlgorithms";

const PerfilDeUsuario = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const profileUserId = searchParams.get("id"); 
  const { loggedInUser, setLoggedInUser } = useAuth();

  const [usuario, setUsuario] = useState<any>(null);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      const [userData, avaliacoesData] = await Promise.all([
        getOneUser(Number(userId)),
        getAvaliacoesByUser(Number(userId)),
      ]);
      setUsuario(userData);

      const avaliacoesComProfessor = await Promise.all(
        avaliacoesData.map(async (avaliacao: any) => {
          try {
            const professor = await getOneProf(avaliacao.profId);
            return { ...avaliacao, nomeProfessor: professor.nome };
          } catch {
            return { ...avaliacao, nomeProfessor: "Não informado" };
          }
        })
      );

      const avaliacoesOrdenadas = mergeSort(
        avaliacoesComProfessor,
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
      );
      
      setAvaliacoes(avaliacoesOrdenadas);
    } catch (error) {
      console.error("Erro ao carregar dados do perfil:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleSaveProfile = (updatedUser: any) => {
    setUsuario(updatedUser);
    setLoggedInUser(updatedUser);
  };

  const isOwnerOfProfile = loggedInUser && loggedInUser.id === Number(profileUserId);

  if (loading) {
    return (
      <>
        
        <div className="text-center py-10">Carregando perfil...</div>
      </>
    );
  }

  return (
    <>
      
      <div className="flex bg-[#EDEDED] min-h-[calc(100vh-60px)] pt-10 pb-10 px-4">
        <div className="w-full max-w-2xl mx-auto relative">
          <button
            onClick={() => router.back()}
            className="absolute top-8 left-0 md:left-[-60px] w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border flex items-center justify-center shadow-md hover:bg-gray-200 transition"
            title="Voltar"
          >
            <FaArrowLeft className="text-gray-700 text-lg md:text-xl" />
          </button>

          <div className="relative">
            <div className="bg-yellow-100 h-32 rounded-t-lg"></div>

            <div className="bg-white rounded-b-lg shadow-md px-4 sm:px-6 pb-6 pt-1 -mt-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <img
                  src={profileImageLoader({ src: usuario?.fotosrc })}
                  alt="Foto do usuário"
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg -mt-16"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/profileSemFoto/profileSemFoto.jpg"; }}
                />
                <div className="flex flex-col items-center md:items-end gap-2 mt-2 md:mt-4">
                  {isOwnerOfProfile && (
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="bg-[#050036] text-white text-sm px-5 py-2 rounded-full hover:scale-105 transition"
                    >
                      Editar Perfil
                    </button>
                  )}
                </div>
              </div>
              <div className="pt-4 text-center md:text-left">
                <h2 className="text-2xl font-semibold text-[#222E50] mb-2">
                  {usuario?.nome ?? "Nome não informado"}
                </h2>
                <p className="text-[#222E50] flex items-center justify-center md:justify-start text-sm">
                  <FaBuilding className="mr-2 text-base" />
                  {usuario?.curso ?? "Curso não informado"}/{usuario?.departamento ?? "Departamento não informado"}
                </p>
                <p className="text-[#222E50] flex items-center justify-center md:justify-start text-sm">
                  <FaEnvelope className="mr-2 text-base" />
                  {usuario?.email ?? "Email não informado"}
                </p>

                <hr className="my-6 border-[#595652]" />

                {/* Avaliações */}
                <div className="pb-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Avaliações
                  </h3>

                  {avaliacoes.length === 0 ? (
                    <p className="text-sm text-gray-600">
                      Nenhuma avaliação ainda.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {avaliacoes.map((avaliacao) => (
                        <PostCard
                          key={avaliacao.id}
                          id={avaliacao.id}
                          userId={avaliacao.userId}
                          userName={usuario?.nome ?? "Usuário"}
                          userImage={
                            usuario?.fotosrc ??
                            "/profileSemFoto/profileSemFoto.jpg"
                          }
                          postDate={new Date(
                            avaliacao.data
                          ).toLocaleString("pt-BR")}
                          nomeProfessor={avaliacao.nomeProfessor}
                          materia={
                            avaliacao.materia ?? "Matéria não informada"
                          }
                          postContent={avaliacao.avaliacao}
                          onAction={fetchData}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && isOwnerOfProfile && (
        <ModalEditarPerfil
          usuario={usuario}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
};

export default PerfilDeUsuario;
