import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaTimes, FaCamera, FaTrashAlt } from 'react-icons/fa';
import { updateUser, changePassword, uploadPhoto, profileImageLoader, deleteUserAccount } from '../../utils/api'; 
import { GiKey } from "react-icons/gi";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

// Funções de validação (mantidas fora do componente para clareza)
const validarSenhaSegura = (senha: string) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(senha);
};
const validarNome = (nome: string) => {
  const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
  return regex.test(nome.trim());
};
const validarEmail = (email: string) => {
  const regexFormato = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regexFormato.test(email.trim());
};

// Interface das props do componente
interface ModalEditarPerfilProps {
  usuario: any;
  onClose: () => void;
  onSave: (updatedUser: any) => void; 
}

// Componente principal
const ModalEditarPerfil: React.FC<ModalEditarPerfilProps> = ({ usuario, onClose, onSave }) => {
  const [view, setView] = useState<'profile' | 'password' | 'delete'>('profile');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    curso: '',
    departamento: '',
  });

  const { setLoggedInUser } = useAuth();

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordData, setPasswordData] = useState({
    senhaAntiga: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    setProfileData({
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      curso: usuario?.curso || '',
      departamento: usuario?.departamento || '',
    });
    setFotoPreview(usuario?.fotosrc || null);
    setFotoFile(null);
  }, [usuario]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setFotoFile(file); 
          setFotoPreview(URL.createObjectURL(file)); 
      }
  };

  const handleSalvarPerfil = async () => {
    setError(null);
    if (!profileData.nome || !profileData.email || !profileData.curso || !profileData.departamento) {
      setError("Todos os campos devem ser preenchidos.");
      return;
    }
    if (!validarNome(profileData.nome)) {
      setError("Nome inválido. Use apenas letras e espaços.");
      return;
    }
    if (!validarEmail(profileData.email)) {
      setError("Formato de e-mail inválido.");
      return;
    }

    setIsLoading(true);
    try {
      let updatedUserData = { ...usuario };
      if (fotoFile) {
        const userAfterUpload = await uploadPhoto(usuario.id, fotoFile);
        updatedUserData = { ...updatedUserData, ...userAfterUpload };
      }

      const finalUpdatedUser = await updateUser(usuario.id, profileData);
      updatedUserData = { ...updatedUserData, ...finalUpdatedUser };
      
      onSave(updatedUserData); 
      onClose(); 
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao atualizar o perfil.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalvarSenha = async () => {
    setError(null);
    const { senhaAntiga, novaSenha, confirmarSenha } = passwordData;
    if (!senhaAntiga || !novaSenha || !confirmarSenha) {
      setError("Todos os campos de senha devem ser preenchidos.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setError("A nova senha e a confirmação não correspondem.");
      return;
    }
    if (!validarSenhaSegura(novaSenha)) {
      setError("A nova senha não é segura. Use 8+ caracteres, com maiúsculas, minúsculas, números e símbolos (@$!%*?&).");
      return;
    }
    setIsLoading(true);
    try {
        await changePassword(usuario.id, senhaAntiga, novaSenha);
        onClose();
    } catch (err: any) {
        setError(err.response?.data?.message || "Erro ao alterar a senha.");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleExcluirConta = async () => {
    setError(null);
    if (!deletePassword) {
      setError("Por favor, insira sua senha para confirmar a exclusão.");
      return;
    }

    setIsLoading(true);
    try {
      await deleteUserAccount(usuario.id, deletePassword);
      
      localStorage.removeItem('token'); 
      setLoggedInUser(null);
      
      alert('Conta excluída com sucesso.'); 
      onClose();
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao excluir a conta.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FaTimes size={20} />
        </button>
        {(view === 'password' || view === 'delete') && (
          <button onClick={() => { setView('profile'); setError(null); }} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
            <FaArrowLeft size={20} />
          </button>
        )}
        <div className="p-8">
          {view === 'profile' ? (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                    <img
                        src={profileImageLoader({ src: fotoPreview })}
                        alt="Foto de perfil"
                        className="w-28 h-28 rounded-full object-cover border-4 border-gray-100"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = "/profileSemFoto/profileSemFoto.jpg"; }}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-gray-700 text-white rounded-full p-2 hover:bg-gray-900 transition-colors"
                        title="Alterar foto"
                    >
                        <FaCamera />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFotoChange}
                        accept="image/png, image/jpeg"
                        className="hidden"
                    />
                </div>
                <div className="w-full space-y-4">
                  <input type="text" name="nome" placeholder="Nome" value={profileData.nome} onChange={handleProfileChange} className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#050036]" />
                  <input type="email" name="email" placeholder="Email" value={profileData.email} onChange={handleProfileChange} className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#050036]" />
                  <input type="text" name="curso" placeholder="Curso" value={profileData.curso} onChange={handleProfileChange} className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#050036]" />
                  <input type="text" name="departamento" placeholder="Departamento" value={profileData.departamento} onChange={handleProfileChange} className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#050036]" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
              <div className="space-y-3">
                <button onClick={() => { setView('delete'); setError(null); }} className="w-full text-red-600 font-semibold py-3 px-4 rounded-lg border-2 border-red-500 hover:bg-red-50 hover:scale-103 duration-200 cursor-pointer">
                  Excluir Conta
                </button>
                <button onClick={() => { setView('password'); setError(null); }} className="w-full text-[#050036] font-semibold py-3 px-4 rounded-lg border-2 border-[#050036] hover:scale-103 duration-200 cursor-pointer">
                  Alterar senha
                </button>
                <button disabled={isLoading} className="w-full bg-[#050036] text-white font-semibold py-3 px-4 rounded-lg border-2 hover:scale-103 duration-200 cursor-pointer disabled:opacity-50" onClick={handleSalvarPerfil}>
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </>
          ) : view === 'password' ? (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="mb-4 p-4 rounded-full">
                    <GiKey size={60} className="text-[#050036]" />
                </div>
                <div className="w-full space-y-4">
                  <input type="password" name="senhaAntiga" placeholder="Senha Antiga" value={passwordData.senhaAntiga} onChange={handlePasswordChange} className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#050036]" />
                  <input type="password" name="novaSenha" placeholder="Nova Senha" value={passwordData.novaSenha} onChange={handlePasswordChange} className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#050036]" />
                  <input type="password" name="confirmarSenha" placeholder="Confirmar Senha" value={passwordData.confirmarSenha} onChange={handlePasswordChange} className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#050036]" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
              <button disabled={isLoading} className="w-full bg-[#050036] text-white font-semibold py-3 px-4 rounded-lg border-2 hover:scale-103 duration-200 cursor-pointer disabled:opacity-50" onClick={handleSalvarSenha}>
                {isLoading ? 'Salvando...' : 'Salvar Senha'}
              </button>
            </>
          ) : ( // view === 'delete'
            <>
              <div className="flex flex-col items-center mb-6 text-center">
                <div className="mb-4 p-4 rounded-full bg-red-100">
                    <FaTrashAlt size={50} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Excluir sua conta?</h2>
                <p className="text-gray-600 mb-4">
                  Esta ação é permanente e não pode ser desfeita. Para confirmar, por favor, digite sua senha.
                </p>
                <div className="w-full space-y-4">
                  <input 
                    type="password" 
                    name="deletePassword" 
                    placeholder="Sua Senha Atual" 
                    value={deletePassword} 
                    onChange={(e) => setDeletePassword(e.target.value)} 
                    className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" 
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
              <div className="flex gap-3">
                <button 
                  onClick={() => { setView('profile'); setError(null); }} 
                  className="w-full text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-300 hover:bg-gray-100 duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  disabled={isLoading} 
                  className="w-full bg-red-600 text-white font-semibold py-3 px-4 rounded-lg border-2 border-red-600 hover:bg-red-700 hover:scale-103 duration-200 cursor-pointer disabled:opacity-50" 
                  onClick={handleExcluirConta}
                >
                  {isLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEditarPerfil;