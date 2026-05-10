import React, { useEffect, useState } from 'react';
import { NotificacaoBalao } from '../Notificacão/Notificacao_balao';
import { getNotificacoesByUser, marcarTodasNotificacoesComoLidas } from '../../utils/api';
import { FaCheck } from 'react-icons/fa';

interface Notificacao {
  id: number;
  texto: string;
  tipo: string;
  link: string;
  lida: boolean;
}

interface Notificacao_GProps {
  userId: number;
  onMarcarTodasComoLidas?: () => void;
}

export const Notificacao_G: React.FC<Notificacao_GProps> = ({ userId, onMarcarTodasComoLidas }) => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotificacoes = async () => {
    try {
      const data: Notificacao[] = await getNotificacoesByUser(userId);
      setNotificacoes(data);

      const unread = data.filter((n) => !n.lida).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificacoes();
  }, [userId]);

  const handleMarcarTodasComoLidas = async () => {
    try {
      await marcarTodasNotificacoesComoLidas(userId);
      const atualizadas = notificacoes.map((n) => ({ ...n, lida: true }));
      setNotificacoes(atualizadas);
      setUnreadCount(0);

      if (onMarcarTodasComoLidas) {
        onMarcarTodasComoLidas();
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  return (
    <div className="max-h-96 overflow-y-auto w-[360px] rounded-md p-4 pt-8 bg-[#FFFFFF] relative">
      <button
        onClick={handleMarcarTodasComoLidas}
        className="absolute right-4 top-2 text-[#1f3c9d] hover:text-[#050036]"
        title="Marcar todas como lidas"
      >
        <FaCheck size={18} />
      </button>

      {loading && <p className="text-gray-500">Carregando...</p>}

      {!loading && notificacoes.length === 0 && (
        <p className="text-gray-500">Nenhuma notificação encontrada.</p>
      )}

      {notificacoes.map((notificacao) => (
        <NotificacaoBalao
          key={notificacao.id}
          texto={notificacao.texto}
          tipo={notificacao.tipo as 'NOVO_COMENTARIO' | 'NOVO_PROFESSOR'}
          link={notificacao.link}
          lida={notificacao.lida}
        />
      ))}

      {notificacoes.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas 🎉'}
        </div>
      )}
    </div>
  );
};
