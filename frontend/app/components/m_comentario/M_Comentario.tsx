"use client";
import React, { useRef, useEffect, useState } from "react";
import { Bold, Italic } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { postComentario, createNotificacao, getOneAvaliacao } from "@/app/utils/api";
import Botao from "../botao_azul/Botao_Azul";

interface ModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  avaliacaoId: number;
}

const Mcomentario: React.FC<ModalProps> = ({ isOpen, onCloseAction, avaliacaoId }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [negritoAtivo, setNegritoAtivo] = useState(false);
  const [italicoAtivo, setItalicoAtivo] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Pega userId do token quando o modal abre
  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: { sub?: string } = jwtDecode(token);
        if (decoded.sub) {
          setUserId(Number(decoded.sub));
        }
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      }
    }
  }, [isOpen]);

  // Atualiza o estado dos botões negrito/italico conforme seleção do usuário
  useEffect(() => {
    const updateToolbarState = () => {
      setNegritoAtivo(document.queryCommandState("bold"));
      setItalicoAtivo(document.queryCommandState("italic"));
    };
    document.addEventListener("selectionchange", updateToolbarState);
    return () => {
      document.removeEventListener("selectionchange", updateToolbarState);
    };
  }, []);

  const toggleBold = () => {
    document.execCommand("bold");
    setNegritoAtivo((prev) => !prev);
  };

  const toggleItalic = () => {
    document.execCommand("italic");
    setItalicoAtivo((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("Usuário não identificado.");
      return;
    }

    const conteudoRaw = editorRef.current?.innerHTML || "";
    // Remove tags HTML para validar conteúdo visível
    const conteudoLimpo = conteudoRaw.replace(/<(.|\n)*?>/g, "").trim();

    if (!conteudoLimpo) {
      alert("Digite algo no comentário antes de enviar.");
      return;
    }

    try {
      console.log("Enviando comentário:", { conteudo: conteudoRaw, userId, avaliacaoId });

      // Envia comentário
      await postComentario(conteudoRaw, userId, avaliacaoId);

      // Busca dono da avaliação
      const avaliacao = await getOneAvaliacao(avaliacaoId);
      const donoId = avaliacao.userId;

      // Cria notificação se não for o próprio usuário comentando
      if (donoId && donoId !== userId) {
        await createNotificacao({
          usersId: donoId,
          texto: "Você recebeu um novo comentário na sua avaliação!",
          tipo: "NOVO_COMENTARIO",
          link: `/avaliacao/${avaliacaoId}`,
        });
        console.log("Notificação enviada para o dono da avaliação!");
      }

      console.log("Comentário e notificação enviados com sucesso!");
      onCloseAction();
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      alert("Erro ao enviar comentário. Tente novamente.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(5,0,54,0.30)] z-40 flex items-center justify-center"
      onClick={onCloseAction}
    >
      <div
        className="bg-[#ECEDBC] w-[60%] h-[60%] rounded-[20px] shadow-xl py-6 px-8 z-50 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full w-full justify-between gap-4"
        >
          <div className="bg-white border border-gray-300 rounded-[20px] overflow-hidden h-[70%] flex flex-col">
            <div className="flex gap-3 px-4 py-2 border-b border-gray-300 text-[#050036]">
              <button
                type="button"
                onClick={toggleBold}
                className={`p-1 rounded ${negritoAtivo ? "bg-blue-100 text-blue-600" : "text-[#050036]"}`}
                aria-label="Negrito"
              >
                <Bold className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={toggleItalic}
                className={`p-1 rounded ${italicoAtivo ? "bg-blue-100 text-blue-600" : "text-[#050036]"}`}
                aria-label="Itálico"
              >
                <Italic className="w-5 h-5" />
              </button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              className="flex-1 px-4 py-3 text-base overflow-y-auto focus:outline-none"
              style={{ minHeight: "100px" }}
              role="textbox"
              aria-multiline="true"
              spellCheck={true}
            />
          </div>

          <div className="flex justify-end items-center gap-6 mt-auto pr-[50px] pb-[20px]">
            <button
              type="button"
              onClick={onCloseAction}
              className="text-xs sm:text-2xl text-[#050036] hover:underline pr-[40px]"
            >
              Cancelar
            </button>
            <Botao type="submit">Comentar</Botao>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Mcomentario;
