'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Botao_Branco from '../botao_branco/Botao_branco';
import { jwtDecode } from 'jwt-decode';
import { countNaoLidas, getOneUser, profileImageLoader } from '@/app/utils/api';
import MenuModal from '../menu_modal/MenuModal';
import PopUp from '../popup/PopUp';
import { Notificacao_G } from '../Notificacão/Caixa_grande';
import { GiTeacher } from 'react-icons/gi'; 
import { Criaprof } from '../M_CriarProfessor/Criaprof';
import { useAuth } from '@/app/contexts/AuthContext';

export default function NavBar() {
  const router = useRouter();
  const { loggedInUser, setLoggedInUser, isLoading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [notificacaoModalOpen, setNotificacaoModalOpen] = useState(false);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [userID, setUserID] = useState<number | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const notificacaoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loggedInUser) {
      countNaoLidas(loggedInUser.id)
        .then(count => setNotificacoesNaoLidas(count))
        .catch(err => console.error('Erro ao contar notificações:', err));

    } else {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
        try {
          const decoded: { sub?: string, isAdmin?: boolean } = jwtDecode(token);
          if (decoded.sub) {
            const id = Number(decoded.sub);
            setUserID(id);
            setIsAdmin(decoded.isAdmin || false);

            getOneUser(id)
              .then(user => setUserPhoto(user.fotosrc ?? null))
              .catch(err => console.error('Erro ao buscar foto:', err));

            countNaoLidas(id)
              .then(count => setNotificacoesNaoLidas(count))
              .catch(err => console.error('Erro ao contar notificações:', err));
          }
        } catch (error) {
          console.error('Erro ao decodificar token:', error);
        }
      } else {
        setIsLoggedIn(false);
      }
    }
  }, [loggedInUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificacaoRef.current &&
        !notificacaoRef.current.contains(event.target as Node)
      ) {
        setNotificacaoModalOpen(false);
      }
    };

    if (notificacaoModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificacaoModalOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setLoggedInUser(null);
    router.push('/login');
  };

  const handleOpenMenuModal = () => setIsMenuModalOpen(true);
  const handleCloseMenuModal = () => setIsMenuModalOpen(false);
  const handleEnviarAvaliacao = () => {
    setIsPopUpOpen(true);
    setTimeout(() => setIsPopUpOpen(false), 3000);
  };
  const atualizarContadorParaZero = () => setNotificacoesNaoLidas(0);

  if (isLoading) {
    return <div className="bg-[#050036] h-16" />; 
  }

  return (
  <header>
    <nav className="bg-[#050036] text-white h-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <button
            aria-label="Home"
            className="p-2 rounded-full hover:scale-105 transition"
            onClick={() => router.push('/')}
          >
            <img src="/logo/Logomarca 3.svg" alt="Logo" className="h-10 w-auto" />
          </button>
        </div>

        {loggedInUser ? (
          <ul className="flex items-center gap-1"> {/* Diminui o espaço aqui */}
            {/* Mais */}
            {isAdmin && (
                <li>
                  <button
                    aria-label="Adicionar Professor"
                    onClick={() => setIsAdminModalOpen(true)}
                    className="p-2 rounded-full hover:bg-white/10 transition"
                    title="Adicionar Novo Professor"
                  >
                    <GiTeacher className="h-6 w-6" />
                  </button>
                </li>
              )}
            <li>
              <button
                aria-label="Mais"
                onClick={handleOpenMenuModal}
                className="p-2 rounded-full hover:bg-white/10 transition"
              >
                <img src="/icones-nav/Mais_Icon.png" alt="Mais" className="h-6 w-6" />
              </button>
            </li>

            {/* Notificações */}
            <li className="relative">
              <button
                aria-label="Notificações"
                onClick={() => setNotificacaoModalOpen(!notificacaoModalOpen)}
                className="p-2 rounded-full hover:bg-white/10 transition relative"
              >
                <img src="/icones-nav/Noti_Icon.png" alt="Notificações" className="h-6 w-6" />
                {notificacoesNaoLidas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1">
                    {notificacoesNaoLidas}
                  </span>
                )}
              </button>

              {notificacaoModalOpen && (
                <div ref={notificacaoRef} className="absolute right-0 mt-2 z-50 shadow-lg">
                  <Notificacao_G
                    userId={loggedInUser.id}
                    onMarcarTodasComoLidas={atualizarContadorParaZero}
                  />
                </div>
              )}
            </li>

            {/* Perfil */}
            <li>
              <button
                  onClick={() => router.push(`/perfilDeUsuario?id=${loggedInUser.id}`)}
                  className="p-1 rounded-full hover:scale-105 transition"
                  aria-label="Perfil"
                >
                  <img
                    src={profileImageLoader({ src: loggedInUser.fotosrc })}
                    alt="Perfil"
                    className="h-8 w-8 rounded-full object-cover border border-white"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = "/profileSemFoto/profileSemFoto.jpg"; }}
                  />
                </button>
            </li>

            {/* Sair */}
            <li>
              <button
                onClick={handleLogout}
                aria-label="Sair"
                className="p-2 rounded-full hover:bg-white/10 transition"
              >
                <img src="/icones-nav/Saida_Icon.png" alt="Sair" className="h-6 w-6" />
              </button>
            </li>
          </ul>
        ) : (
          <ul className="flex gap-3">
            <li>
              <Botao_Branco onClick={() => router.push('/login')} type="button">
                Login
              </Botao_Branco>
            </li>
            <li>
              <Botao_Branco onClick={() => router.push('/cadastro')} type="button">
                Cadastro
              </Botao_Branco>
            </li>
          </ul>
        )}
      </div>
    </nav>

      <MenuModal
        isOpen={isMenuModalOpen}
        onClose={handleCloseMenuModal}
        onEnviarAvaliacao={handleEnviarAvaliacao}
      />

      <PopUp
        isOpen={isPopUpOpen}
        title="Avaliação enviada com sucesso!"
        description="Obrigado pela sua contribuição 🎉"
      />
      <Criaprof 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </header>
  );
}
