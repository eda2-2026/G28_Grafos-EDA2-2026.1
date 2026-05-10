'use client';
import React, { useRef, useState } from 'react';
import Botao_Azul from '../botao_azul/Botao_Azul';
import { IoClose } from 'react-icons/io5';
import { FaCamera } from 'react-icons/fa';
import { createProfessor } from '@/app/utils/api';

interface ModalProfProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Criaprof = ({ onClose, isOpen }: ModalProfProps) => {
  const [nome, setNome] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [materias, setMaterias] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setNome('');
    setDepartamento('');
    setMaterias('');
    setSelectedImage(null);
    setError('');

  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedImage(event.target.files?.[0] || null);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !departamento || !materias) {
      setError('Os campos Nome, Departamento e Aulas são obrigatórios.');
      return;
    }

    const materiasArray = materias.split(',').map(m => m.trim()).filter(m => m);
    setError('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('departamento', departamento);
    formData.append('materias', JSON.stringify(materiasArray)); // Envia as matérias como JSON
    if (selectedImage) {
      formData.append('foto', selectedImage);
    }

    try {
      await createProfessor(formData, true); // O segundo argumento indica que estamos enviando FormData
      alert('Professor criado com sucesso!');
      console.log("Modal: Disparando o evento 'professorCreated'!");
      window.dispatchEvent(new CustomEvent('professorCreated'));
      resetForm();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Falha ao criar professor.';
      setError(errorMessage);
      console.error('Erro ao criar professor:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center'>
      <form onSubmit={handleSubmit} className='bg-[#EDEDED] w-90 max-w-lg rounded-lg p-6 flex flex-col gap-y-4'>
        <div className='flex justify-between items-center mb-2'>
          <h2 className='text-xl font-bold text-[#050036]'>Adicionar Novo Professor</h2>
          <button type="button" className='text-2xl text-gray-500 hover:text-black' onClick={handleClose}>
            <IoClose />
          </button>
        </div>

        <div className='flex flex-col items-center justify-center'>
          <img
            src={selectedImage ? URL.createObjectURL(selectedImage) : "/profileSemFoto/profileSemFoto.jpg"}
            alt="Foto do professor"
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer"
            onClick={handleImageClick}
          />
          <button
            type="button"
            className='-mt-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300'
            onClick={handleImageClick}
          >
            <FaCamera className='text-black w-5 h-5' />
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            ref={fileInputRef}
          />
        </div>

        <div className='flex flex-col gap-y-3'>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className='w-full bg-white rounded-xl p-3 text-black' placeholder='Nome Completo' required />
          <input type="text" value={departamento} onChange={(e) => setDepartamento(e.target.value)} className='w-full bg-white rounded-xl p-3 text-black' placeholder='Departamento' required />
          <input type="text" value={materias} onChange={(e) => setMaterias(e.target.value)} className='w-full bg-white rounded-xl p-3 text-black' placeholder='Matérias (separadas por vírgula)' required />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className='flex items-center justify-center mt-2'>
          <Botao_Azul type="submit">
            Criar
          </Botao_Azul>
        </div>
      </form>
    </div>
  );
};