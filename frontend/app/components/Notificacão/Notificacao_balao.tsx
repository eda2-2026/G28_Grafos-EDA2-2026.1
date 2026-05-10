import React from 'react';
import { FaCommentAlt, FaLightbulb } from 'react-icons/fa';

type NotificacaoProps = {
  texto: string;
  tipo: 'NOVO_COMENTARIO' | 'NOVO_PROFESSOR';
  link?: string;
  lida?: boolean; // nova prop opcional
};

export const NotificacaoBalao: React.FC<NotificacaoProps> = ({ texto, tipo, link, lida = false }) => {
  const getIcon = () => {
    if (tipo === 'NOVO_COMENTARIO') return <FaCommentAlt size={20} />;
    if (tipo === 'NOVO_PROFESSOR') return <FaLightbulb size={20} />;
    return null;
  };

  const Wrapper = link ? 'a' : 'div';

  // Definindo a cor do texto: cinza se lida, preto se não lida
  const textoCorClass = lida ? 'text-gray-500 font-normal' : 'text-black font-semibold';

  return (
    <Wrapper
      href={link}
      className="flex items-start p-4 w-full h-[10%] bg-white cursor-pointer hover:bg-[#ECEDBC] border border-gray"
    >
      <div className="text-gray-700 mt-1">{getIcon()}</div>
      <div className="flex-1">
        <div className={`ml-2 ${textoCorClass}`}>
          <p>{texto}</p>
        </div>
      </div>
    </Wrapper>
  );
};
