import React, { ReactNode, MouseEventHandler } from 'react';

interface BotaoProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
}

const Botao_Branco: React.FC<BotaoProps> = ({children, onClick, type}) => {
  return (
    <button className="text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-7 py-1.5 sm:py-2 rounded-xl bg-white text-[#050036] hover:scale-105 transition-transform duration-200 cursor-pointer"
      onClick={onClick}
      type = {type || 'button'}
    >
      {children}
    </button>
  )
}

export default Botao_Branco