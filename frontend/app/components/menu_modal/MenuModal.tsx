"use client";
import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic } from 'lucide-react';
import { postAvaliacao, getAllProf } from '@/app/utils/api';
import { jwtDecode } from 'jwt-decode';
import Botão from '../botao_azul/Botao_Azul';
import { insertionSort } from '@/app/utils/sortingAlgorithms';

const execCommand = (command: string, value?: string) => {
  document.execCommand(command, false, value);
};

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnviarAvaliacao: () => void; // <<< ADICIONADO
}

interface Professor {
  id: number;
  nome: string;
  materias: { id: number; nome: string }[];
}

const MenuModal: React.FC<MenuModalProps> = ({ isOpen, onClose, onEnviarAvaliacao }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [materiaSelecionada, setMateriaSelecionada] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: { sub?: string } = jwtDecode(token);
        if (decoded.sub) {
          setCurrentUserId(Number(decoded.sub));
        }
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      getAllProf()
        .then((res) => {
          const sortedProf = insertionSort(
            res,
            (a: Professor, b: Professor) => a.nome.localeCompare(b.nome)
          ).map((prof: Professor) => ({
            ...prof,
            materias: insertionSort(
              prof.materias,
              (a, b) => a.nome.localeCompare(b.nome)
            ),
          }));
          
          setProfessores(sortedProf);
        })
        .catch((err) => console.error("Erro ao buscar professores:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    const updateToolbarState = () => {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
    };

    document.addEventListener('selectionchange', updateToolbarState);
    return () => {
      document.removeEventListener('selectionchange', updateToolbarState);
    };
  }, []);

  const toggleBold = () => {
    execCommand('bold');
    setIsBold((prev) => !prev);
  };

  const toggleItalic = () => {
    execCommand('italic');
    setIsItalic((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    const editorContent = document.getElementById("editor")?.innerHTML || "";
    if (!currentUserId) {
      alert("Usuário não autenticado.");
      return;
    }
    if (!professorSelecionado || !materiaSelecionada || !editorContent.trim()) {
      alert("Preencha todos os campos antes de enviar.");
      return;
    }

    try {
      await postAvaliacao(
        editorContent,
        materiaSelecionada,
        currentUserId,
        Number(professorSelecionado)
      );

      // Chama a função recebida na prop
      onEnviarAvaliacao();
      
      onClose();
    } catch (error) {
      console.error("Erro ao postar avaliação:", error);
    }
  };

  const profAtual = professores.find(p => p.id === Number(professorSelecionado));

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(5,0,54,0.30)] z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        ref={modalContentRef}
        className="bg-[#ECEDBC] w-[70%] h-[80%] rounded-[20px] shadow-xl py-6 px-8 z-50 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <form className="flex flex-col h-full w-full justify-between gap-4">
          <div className="flex flex-col gap-4 pt-[25px]">
            <div className="relative">
              <select
                value={professorSelecionado}
                onChange={(e) => {
                  setProfessorSelecionado(e.target.value);
                  setMateriaSelecionada("");
                }}
                className="w-full px-4 py-4 bg-white pl-[30px] text-[#050036] text-xl rounded-[20px] border border-gray-300 appearance-none focus:outline-none"
              >
                <option value="" disabled>Nome do professor</option>
                {professores.map(prof => (
                  <option key={prof.id} value={prof.id}>{prof.nome}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700 pr-[20px]">
                <svg className="h-7 w-7 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 6" fill="currentColor"><polygon points="0,0 10,0 5,6" /></svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={materiaSelecionada}
                onChange={(e) => setMateriaSelecionada(e.target.value)}
                disabled={!profAtual}
                className="w-full px-4 py-4 bg-white pl-[30px] text-[#050036] text-xl rounded-[20px] border border-gray-300 appearance-none focus:outline-none"
              >
                <option value="" disabled>Disciplina</option>
                {profAtual?.materias.map(mat => (
                  <option key={mat.id} value={mat.nome}>{mat.nome}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700 pr-[20px]">
                <svg className="h-7 w-7 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 6" fill="currentColor"><polygon points="0,0 10,0 5,6" /></svg>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="bg-white border border-gray-300 rounded-[20px] overflow-hidden h-[35%] flex flex-col">
            <div className="flex gap-3 px-4 py-2 border-b border-gray-300 text-[#050036]">
              <button type="button" onClick={toggleBold} className={`p-1 rounded ${isBold ? 'bg-blue-100 text-blue-600' : 'text-[#050036]'}`}>
                <Bold className="w-5 h-5" />
              </button>
              <button type="button" onClick={toggleItalic} className={`p-1 rounded ${isItalic ? 'bg-blue-100 text-blue-600' : 'text-[#050036]'}`}>
                <Italic className="w-5 h-5" />
              </button>
            </div>
            <div id="editor" contentEditable className="flex-1 px-4 py-3 text-base overflow-y-auto focus:outline-none" style={{ minHeight: '100px' }} />
          </div>

          <div className="flex justify-end items-center gap-6 mt-auto pr-[50px] pb-[20px]">
            <button type="button" onClick={onClose} className="text-xs sm:text-2xl text-[#050036] hover:underline pr-[40px]">Cancelar</button>
            <Botão onClick={handleSubmit}>Avaliar</Botão>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuModal;
