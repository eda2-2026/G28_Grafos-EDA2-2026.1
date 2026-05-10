"use client";
import React, { useRef, useEffect, useState } from "react";
import { Bold, Italic } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { updateAvaliacao } from "@/app/utils/api"; // agora o nome correto
import Botao from "@/app/components/botao_azul/Botao_Azul";

interface ModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  avaliacaoId: number;         // id da avaliação
  avaliacaoAtual: string;      // conteúdo atual
}

const MeditAvaliacao: React.FC<ModalProps> = ({ isOpen, onCloseAction, avaliacaoId, avaliacaoAtual }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [negritoAtivo, setNegritoAtivo] = useState(false);
  const [italicoAtivo, setItalicoAtivo] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

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

  useEffect(() => {
    if (isOpen && editorRef.current) {
      editorRef.current.innerHTML = avaliacaoAtual || "";
    }
  }, [isOpen, avaliacaoAtual]);

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

    const avaliacaoRaw = editorRef.current?.innerHTML || "";
    const avaliacaoLimpo = avaliacaoRaw.replace(/<(.|\n)*?>/g, "").trim();

    if (!avaliacaoLimpo) {
      alert("Digite algo na avaliação antes de enviar.");
      return;
    }

    try {
      console.log("Editando avaliação:", { avaliacao: avaliacaoRaw, userId, avaliacaoId });
      await updateAvaliacao(avaliacaoId, avaliacaoRaw);
      console.log("Avaliação editada com sucesso!");
      onCloseAction();
    } catch (error) {
      console.error("Erro ao editar avaliação:", error);
      alert("Erro ao editar avaliação. Tente novamente.");
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
            <Botao type="submit">Editar</Botao>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeditAvaliacao;
