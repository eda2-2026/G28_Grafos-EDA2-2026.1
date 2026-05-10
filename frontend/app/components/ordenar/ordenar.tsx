'use client';
import React, { useState, useEffect, useRef } from 'react';

type OrdenacaoType = 'nome' | 'departamento' | 'antigas' | 'recentes';

interface DropdownProps {
  ordenacao : OrdenacaoType;
  setOrdenacao: (ord: OrdenacaoType) => void;
}

const getTextoOrdenacao = (ord: OrdenacaoType) => {
  switch (ord) {
    case 'nome': return 'Nome';
    case 'departamento': return 'Departamento';
    case 'antigas': return 'Mais Antigos';
    case 'recentes': return 'Recentes';
    default: return 'Ordenar';
  }
};

const DropdownOrdenar: React.FC<DropdownProps> = ({ ordenacao, setOrdenacao }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className='cursor-pointer bg-[#050036] text-white px-4 py-2 rounded-xl'>
        {getTextoOrdenacao(ordenacao)}
      </button>
      {open && (
        <div className='absolute z-50 flex flex-col bg-[#050036] opacity-50 shadow-lg rounded-xl mt-2 w-40 text-white right-0'>
          <button
            onClick={() => { setOrdenacao('nome'); setOpen(false); }}
            className='hover:bg-gray-200 hover:text-black px-4 py-2 text-left rounded-xl'
          >
            Nome
          </button>
          <button
            onClick={() => { setOrdenacao('departamento'); setOpen(false); }}
            className='hover:bg-gray-200 hover:text-black px-4 py-2 text-left rounded-xl'
          >
            Departamento
          </button>
          <button
            onClick={() => { setOrdenacao('antigas'); setOpen(false); }}
            className='hover:bg-gray-200 hover:text-black px-4 py-2 text-left rounded-xl'
          >
            Mais Antigos
          </button>
          <button
            onClick={() => { setOrdenacao('recentes'); setOpen(false); }}
            className='hover:bg-gray-200 hover:text-black px-4 py-2 text-left rounded-xl'
          >
            Recentes
          </button>
        </div>
      )}
    </div>
  );
};

export default DropdownOrdenar;
