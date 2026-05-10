import React, { ReactNode, MouseEventHandler } from 'react';

interface BotaoProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
}

const Botao_Azul: React.FC<BotaoProps> = ({children, onClick, type}) => {
  return (
    <button className="w-40 bg-[#050036] text-white text-lg px-7 py-3 rounded-xl hover:scale-110 duration-200 cursor-pointer"
      onClick={onClick}
      type={type || 'button'}
    >
      {children}
    </button>
  )
}

export default Botao_Azul