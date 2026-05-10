// app/components/carrossel/carrossel.tsx

'use client';
import React, { useEffect, useState } from 'react';
import ProfQuadro from '../quadro/Quadro';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Professor {
  id : number;
  nome: string;
  materia: string;
  departamento: string;
  fotosrc: string;
}

interface Props {
  professores: Professor[];
}

export default function CarrosselProfessores({ professores }: Props) {
  const [index, setIndex] = useState(0);
  const [itensVisiveis, setItensVisiveis] = useState(5);
  const router = useRouter();
  const centro = Math.floor(itensVisiveis / 2);

  useEffect(() => {
  const atualizarItensVisiveis = () => {
    const largura = window.innerWidth;
    if (largura < 640) setItensVisiveis(1);
    else if (largura < 768) setItensVisiveis(3);
    else if (largura < 1024) setItensVisiveis(3);
    else if (largura < 1280) setItensVisiveis(3);
    else setItensVisiveis(5);
  };

  atualizarItensVisiveis();
  window.addEventListener('resize', atualizarItensVisiveis);
  return () => window.removeEventListener('resize', atualizarItensVisiveis);
}, []);

  const handlePrev = () => {
    setIndex((prevIndex) =>
      prevIndex === 0 ? professores.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setIndex((prevIndex) =>
      (prevIndex + 1) % professores.length
    );
  };

  const professoresVisiveis = [...professores, ...professores].slice(index, index + itensVisiveis);

  return (
    <div className="flex flex-col items-center gap-4 py-1 ">
      <div className="flex gap-4 items-center">
        <button onClick={handlePrev} className="px-2 py-1 rounded cursor-pointer"><FaChevronLeft /></button>

        <div className="flex overflow-hidden px-0.5 py-5">
          {professoresVisiveis.map((prof, i) => { 
            const distancia = Math.abs(i - centro); 

            let estilo = '';
            let margem = '';
            if (distancia === 0) {
                estilo = 'scale-110 opacity-100 z-30'; 
                margem = 'mx-4';
            } else if (distancia === 1) {
                estilo = 'scale-100 opacity-70 z-20';
                margem = 'mx-3';
            } else {
                estilo = 'scale-95 opacity-50 z-10';
                margem = 'mx-1';
            }

            const indiceReal = (index + i) % professores.length;
            const novoIndex = (indiceReal - centro + professores.length) % professores.length;

            const handleClick = () => {
                if(i === centro) {
                    router.push(`/perfilDeProfessor?id=${prof.id}`);
                } else {
                    setIndex(novoIndex);
                }
            }

            return (
                <div key={i + '-' + prof.nome} 
                className={`transition-all duration-500 ease-in-out ${estilo} ${margem}`}
                onClick={handleClick}
                >
                <ProfQuadro {...prof} />
                </div>
            );
            })}
        </div>

        <button onClick={handleNext} className="px-2 py-1 rounded cursor-pointer"><FaChevronRight /></button>
      </div>
    </div>
  );
}