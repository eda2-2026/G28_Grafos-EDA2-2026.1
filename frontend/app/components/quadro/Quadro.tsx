import React from 'react';
import { profileImageLoader } from '@/app/utils/api'; // 1. Importamos a função auxiliar

interface ProfProps {
  id: number;
  nome: string;
  materia: string;
  departamento : string;
  fotosrc: string;
}

const ProfQuadro: React.FC<ProfProps> = ({ nome, departamento, fotosrc }) => {
    return (
        <div className="w-36 h-52 sm:w-40 sm:h-56 md:w-44 md:h-60 lg:w-48 lg:h-64 bg-white text-[#000000] px-4 py-3 rounded-xl hover:scale-105 transition-transform duration-200 cursor-pointer shadow-md">
            <img 
                src={profileImageLoader({ src: fotosrc })} 
                alt={nome}
                className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 mx-auto mt-2 object-cover rounded-xl"
                onError={(e) => { (e.target as HTMLImageElement).src = "/profileSemFoto/profileSemFoto.jpg"; }}
            />
            <p className="mt-3 text-center text-sm sm:text-base font-medium text-black">{nome}</p>
            <p className="mt-1 text-center text-xs sm:text-sm text-gray-600">{departamento}</p>
        </div>
    );
}

export default ProfQuadro;