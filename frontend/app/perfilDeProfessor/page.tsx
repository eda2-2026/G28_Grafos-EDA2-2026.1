"use client";
import React, { useEffect, useState, useCallback } from "react";
import NavBar from "../components/navbar/NavBar";
import { FaBuilding, FaBook, FaArrowLeft, FaProjectDiagram } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getOneProf,
  getAvaliacoesByProf,
  getOneUser,
  getProfessorNetwork,
  profileImageLoader,
  type ProfessorNetwork,
} from "../utils/api";
import PostCard from "../components/post_card/PostCard";

function stableMergeSort<T>(array: T[], compare: (a: T, b: T) => number): T[] {
  if (!Array.isArray(array)) return array;

  const indexed = array.map((item, index) => ({ item, index }));

  function merge(left: typeof indexed, right: typeof indexed) {
    const result: typeof indexed = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
      const cmp = compare(left[i].item, right[j].item);
      if (cmp < 0) {
        result.push(left[i++]);
      } else if (cmp > 0) {
        result.push(right[j++]);
      } else {
        if (left[i].index <= right[j].index) {
          result.push(left[i++]);
        } else {
          result.push(right[j++]);
        }
      }
    }
    while (i < left.length) result.push(left[i++]);
    while (j < right.length) result.push(right[j++]);
    return result;
  }

  function sortSlice(arr: typeof indexed): typeof indexed {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = sortSlice(arr.slice(0, mid));
    const right = sortSlice(arr.slice(mid));
    return merge(left, right);
  }

  const sortedIndexed = sortSlice(indexed);
  return sortedIndexed.map((x) => x.item);
}

const PerfilDeProfessor = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profId = searchParams.get("id");

  const [professor, setProfessor] = useState<any>(null);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [redeProfessor, setRedeProfessor] = useState<ProfessorNetwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeLoading, setRedeLoading] = useState(false);
  const [redeError, setRedeError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!profId) {
      setLoading(false);
      return;
    }

    const professorId = Number(profId);
    if (Number.isNaN(professorId)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setRedeLoading(true);
    setRedeError(null);
    setRedeProfessor(null);

    try {
      const [profData, avaliacoesData] = await Promise.all([
        getOneProf(professorId),
        getAvaliacoesByProf(professorId),
      ]);
      setProfessor(profData);

      const avaliacoesComUsuario = await Promise.all(
        avaliacoesData.map(async (avaliacao: any) => {
          try {
            const usuario = await getOneUser(avaliacao.userId);
            return {
              ...avaliacao,
              nomeUsuario: usuario.nome,
              fotoUsuario: usuario.fotosrc,
            };
          } catch (error) {
            return {
              ...avaliacao,
              nomeUsuario: "Usuário",
              fotoUsuario: "/profileSemFoto/profileSemFoto.jpg",
            };
          }
        })
      );

      const sortedAvaliacoes = stableMergeSort(avaliacoesComUsuario, (a, b) => {
        const ta = new Date(a.data).getTime();
        const tb = new Date(b.data).getTime();
        // para decrescente - mais recentes no topo
        return tb - ta;
      });

      setAvaliacoes(sortedAvaliacoes);
    } catch (error) {
      console.error("Erro ao carregar dados do professor:", error);
    } finally {
      setLoading(false);
    }

    try {
      const redeData = await getProfessorNetwork(professorId);
      setRedeProfessor(redeData);
    } catch (error) {
      console.error("Erro ao carregar rede do professor:", error);
      setRedeError("Não foi possível carregar a rede deste professor agora.");
    } finally {
      setRedeLoading(false);
    }
  }, [profId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

            <div className="bg-white rounded-b-lg shadow-md px-4 sm:px-6 pt-1 pb-6 -mt-8 relative z-10">
              {/* Foto do professor */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex justify-center md:justify-start -mt-16">
                  <img
                    src={profileImageLoader({ src: professor?.fotosrc })}
                    alt="Foto do professor"
                    className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
              </div>

              {/* Dados do professor */}
              <div className="pt-4 text-center md:text-left">
                <h2 className="text-2xl font-semibold text-[#222E50] mb-2">
                  {professor?.nome ?? "Nome não informado"}
                </h2>

                <p className="text-[#222E50] flex items-center justify-center md:justify-start text-sm">
                  <FaBuilding className="mr-2 text-base" />
                  {professor?.departamento ?? "Departamento não informado"}
                </p>

                <p className="text-[#222E50] flex items-center justify-center md:justify-start text-sm">
                  <FaBook className="mr-2 text-base" />
                  {professor?.materias?.length
                    ? professor.materias.map((m: { nome: string }) => m.nome).join(", ")
                    : "Matérias não informadas"}
                </p>

                <hr className="my-6 border-[#595652]" />

                <section className="pb-6" aria-live="polite">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <FaProjectDiagram className="text-[#222E50]" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Rede de professores
                      </h3>
                    </div>
                    {redeProfessor?.conexoesDiretas?.length ? (
                      <span className="text-xs text-gray-500 text-center sm:text-right">
                        {redeProfessor.conexoesDiretas.length} conexão(ões) no grafo
                      </span>
                    ) : null}
                  </div>

                  {redeLoading ? (
                    <div className="border border-dashed border-[#D8D8D8] rounded-lg p-4 bg-[#F8F8F8]">
                      <p className="text-sm text-gray-600 text-center md:text-left">
                        Carregando rede de professores...
                      </p>
                    </div>
                  ) : redeError ? (
                    <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <p className="text-sm text-yellow-800 text-center md:text-left">
                        {redeError}
                      </p>
                    </div>
                  ) : redeProfessor?.recomendacoes?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {redeProfessor.recomendacoes.map((recomendacao) => (
                        <button
                          key={recomendacao.nodeId}
                          type="button"
                          onClick={() => router.push(`/perfilDeProfessor?id=${recomendacao.professorId}`)}
                          className="group text-left border border-[#D8D8D8] rounded-lg p-3 bg-[#F8F8F8] hover:bg-yellow-50 hover:border-yellow-300 transition focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        >
                          <span className="block text-sm font-semibold text-[#222E50]">
                            {recomendacao.nome}
                          </span>
                          <span className="block text-xs text-gray-600 mt-1">
                            Pontuação {recomendacao.score.toFixed(1)}
                          </span>
                          <span className="block text-xs text-gray-500 mt-2">
                            {recomendacao.breakdown.sharedMatters} matéria(s) e{" "}
                            {recomendacao.breakdown.sharedDepartments} departamento(s) em comum
                          </span>
                          <span className="block text-xs font-semibold text-[#222E50] mt-3 group-hover:underline">
                            Ver perfil
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-[#D8D8D8] rounded-lg p-4 bg-[#F8F8F8]">
                      <p className="text-sm font-medium text-gray-700 text-center md:text-left">
                        Nenhum professor relacionado encontrado.
                      </p>
                      <p className="text-xs text-gray-500 text-center md:text-left mt-1">
                        A rede aparece quando há professores conectados por matéria, departamento ou avaliações.
                      </p>
                    </div>
                  )}
                </section>

                <hr className="my-6 border-[#595652]" />

                {/* Avaliações */}
                <div className="pb-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Avaliações
                  </h3>

                  {avaliacoes.length === 0 ? (
                    <p className="text-sm text-gray-600 text-center md:text-left">
                      Nenhuma avaliação ainda.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {avaliacoes
                        .filter((avaliacao) => typeof avaliacao.id === "number" && !isNaN(avaliacao.id))
                        .map((avaliacao) => (
                          <PostCard
                            key={avaliacao.id}
                            id={avaliacao.id}
                            userId={avaliacao.userId}
                            userName={avaliacao.nomeUsuario ?? "Usuário"}
                            userImage={avaliacao.fotoUsuario ?? "/profileSemFoto/profileSemFoto.jpg"}
                            postDate={new Date(avaliacao.data).toLocaleString("pt-BR")}
                            nomeProfessor={professor?.nome}
                            materia={avaliacao.materia ?? "Matéria não informada"}
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
    </>
  );
};

export default PerfilDeProfessor;
